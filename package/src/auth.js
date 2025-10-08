import { AuthenticationError } from './errors.js';

export class AuthManager {
    constructor(client, storageAdapter = null, authConfig = {}) {
        this.client = client;
        this.storage = storageAdapter || new MemoryStorage();
        this.token = null;
        this.userDetails = null;

        // Auth method configuration: 'oauth' (default), 'jwt', or 'nodehive-api-key'
        this.authMethod = authConfig.method || 'oauth';
        this.oauthConfig = authConfig.oauth || {};
        this.apiKey = authConfig.apiKey || null;

        // If API key is provided, set it immediately
        if (this.apiKey) {
            this.token = this.apiKey;
            this.authMethod = 'nodehive-api-key';
        }
    }

    async login(username, password, options = {}) {
        // API Key authentication doesn't need login
        if (this.authMethod === 'nodehive-api-key') {
            if (!this.token) {
                throw new AuthenticationError('NodeHive API Key is not configured');
            }
            /** @type {'nodehive-api-key'} */
            const method = 'nodehive-api-key';
            return {
                success: true,
                token: this.token,
                method
            };
        }

        if (this.authMethod === 'oauth') {
            // Check if using client credentials grant (no username/password needed)
            const grantType = options.grantType || this.oauthConfig.grantType;
            if (grantType === 'client_credentials') {
                return this.authenticateClientCredentials(options);
            }
            return this._loginOAuth(username, password, options);
        }
        return this._loginJWT(username, password);
    }

    async authenticateClientCredentials(options = {}) {
        try {
            const clientId = options.clientId || this.oauthConfig.clientId;
            const clientSecret = options.clientSecret || this.oauthConfig.clientSecret;
            const scope = options.scope || this.oauthConfig.scope || '';

            if (!clientId || !clientSecret) {
                throw new AuthenticationError('OAuth client credentials are required');
            }

            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            });

            // Add scope if provided
            if (scope) {
                params.append('scope', scope);
            }

            const response = await fetch(
                `${this.client.baseUrl}/oauth/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new AuthenticationError(
                    errorData.error_description || 'Client credentials authentication failed'
                );
            }

            const data = await response.json();
            this.token = data.access_token;

            // Client credentials typically don't have refresh tokens
            // But store it if provided
            if (data.refresh_token) {
                await this.storage.set('refresh_token', data.refresh_token);
            }

            // Store the token
            await this.storage.set('token', data.access_token);

            // Store expires_in for token management
            if (data.expires_in) {
                const expiresAt = Date.now() + (data.expires_in * 1000);
                await this.storage.set('token_expires_at', expiresAt.toString());
            }

            return {
                success: true,
                token: data.access_token,
                expires_in: data.expires_in,
                token_type: data.token_type,
                scope: data.scope
            };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new AuthenticationError(`Client credentials authentication failed: ${error.message}`);
        }
    }

    async _loginJWT(email, password) {
        try {
            // Use btoa for browser compatibility, or Buffer in Node.js
            const loginData = typeof Buffer !== 'undefined'
                ? Buffer.from(`${email}:${password}`).toString('base64')
                : btoa(`${email}:${password}`);
            const response = await fetch(
                `${this.client.baseUrl}/jwt/token?_format=json`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${loginData}`,
                    },
                }
            );

            if (!response.ok) {
                throw new AuthenticationError('Invalid username or password');
            }

            const data = await response.json();
            this.token = data.token;

            const userDetails = await this.fetchUserDetails(data.token);
            this.userDetails = userDetails;

            await this.storage.set('token', data.token);
            await this.storage.set('userDetails', JSON.stringify(userDetails));

            return {
                success: true,
                token: data.token,
                user: userDetails
            };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new AuthenticationError(`Login failed: ${error.message}`);
        }
    }

    async _loginOAuth(username, password, options = {}) {
        try {
            const clientId = options.clientId || this.oauthConfig.clientId;
            const clientSecret = options.clientSecret || this.oauthConfig.clientSecret;

            if (!clientId || !clientSecret) {
                throw new AuthenticationError('OAuth client credentials are required');
            }

            const params = new URLSearchParams({
                grant_type: 'password',
                client_id: clientId,
                client_secret: clientSecret,
                username: username,
                password: password
            });

            const response = await fetch(
                `${this.client.baseUrl}/oauth/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new AuthenticationError(
                    errorData.error_description || 'Invalid username or password'
                );
            }

            const data = await response.json();
            this.token = data.access_token;

            // Store refresh token if available
            if (data.refresh_token) {
                await this.storage.set('refresh_token', data.refresh_token);
            }

            // Fetch user details using the access token
            const userDetails = await this.fetchUserDetailsOAuth(data.access_token);
            this.userDetails = userDetails;

            await this.storage.set('token', data.access_token);
            await this.storage.set('userDetails', JSON.stringify(userDetails));

            return {
                success: true,
                token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                user: userDetails
            };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new AuthenticationError(`OAuth login failed: ${error.message}`);
        }
    }

    async refreshToken() {
        if (this.authMethod === 'nodehive-api-key') {
            throw new AuthenticationError('Token refresh is not needed for NodeHive API Key authentication');
        }
        if (this.authMethod !== 'oauth') {
            throw new AuthenticationError('Token refresh is only available for OAuth authentication');
        }

        try {
            const refreshToken = await this.storage.get('refresh_token');
            if (!refreshToken) {
                throw new AuthenticationError('No refresh token available');
            }

            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: this.oauthConfig.clientId,
                client_secret: this.oauthConfig.clientSecret,
                refresh_token: refreshToken
            });

            const response = await fetch(
                `${this.client.baseUrl}/oauth/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                }
            );

            if (!response.ok) {
                throw new AuthenticationError('Failed to refresh token');
            }

            const data = await response.json();
            this.token = data.access_token;

            if (data.refresh_token) {
                await this.storage.set('refresh_token', data.refresh_token);
            }

            await this.storage.set('token', data.access_token);

            return {
                success: true,
                token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in
            };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new AuthenticationError(`Token refresh failed: ${error.message}`);
        }
    }

    async logout() {
        this.token = null;
        this.userDetails = null;
        await this.storage.remove('token');
        await this.storage.remove('userDetails');
        await this.storage.remove('refresh_token');
    }

    async getToken() {
        if (this.token) {
            return this.token;
        }
        const stored = await this.storage.get('token');
        if (stored) {
            this.token = stored;
        }
        return this.token;
    }

    async getUserDetails() {
        if (this.userDetails) {
            return this.userDetails;
        }
        const stored = await this.storage.get('userDetails');
        if (stored) {
            try {
                this.userDetails = JSON.parse(stored);
            } catch {
                this.userDetails = null;
            }
        }
        return this.userDetails;
    }

    async isLoggedIn() {
        const token = await this.getToken();
        if (!token) return false;

        // NodeHive API Key is always valid (doesn't expire)
        if (this.authMethod === 'nodehive-api-key') {
            return true;
        }

        return !!token;
    }

    async hasValidSession() {
        try {
            const token = await this.getToken();
            if (!token) return false;

            const response = await fetch(
                `${this.client.baseUrl}/user/login_status?_format=json`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) return false;
            const sessionData = await response.json();
            return sessionData === 1;
        } catch {
            return false;
        }
    }

    async fetchUserDetails(token) {
        const decodedJwt = this.decodeJwt(token);
        if (!decodedJwt?.drupal?.uid) {
            throw new AuthenticationError('Invalid token structure');
        }

        const response = await fetch(
            `${this.client.baseUrl}/user/${decodedJwt.drupal.uid}?_format=json`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new AuthenticationError('Failed to fetch user details');
        }

        return await response.json();
    }

    async fetchUserDetailsOAuth(token) {
        try {
            // Try to get the current authenticated user from JSON:API
            const jsonApiResponse = await fetch(
                `${this.client.baseUrl}/jsonapi/user/user?filter[drupal_internal__uid][value]=0&filter[drupal_internal__uid][operator]=>&page[limit]=1`,
                {
                    headers: {
                        'Content-Type': 'application/vnd.api+json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (jsonApiResponse.ok) {
                const data = await jsonApiResponse.json();
                if (data.data?.[0]) {
                    return data.data[0];
                }
            }

            // Fallback: try oauth debug endpoint
            const debugResponse = await fetch(
                `${this.client.baseUrl}/oauth/debug?_format=json`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (debugResponse.ok) {
                const debugData = await debugResponse.json();
                if (debugData.id) {
                    // Try to fetch full user details
                    const userResponse = await fetch(
                        `${this.client.baseUrl}/user/${debugData.id}?_format=json`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (userResponse.ok) {
                        return await userResponse.json();
                    }
                }
                // Return minimal user info from debug endpoint
                return debugData;
            }

            // Last resort: return minimal info
            return { authenticated: true };
        } catch (error) {
            // Don't throw error, just return minimal info
            console.warn('Could not fetch full user details:', error.message);
            return { authenticated: true };
        }
    }

    decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new AuthenticationError('Failed to decode JWT token');
        }
    }

    setToken(token) {
        this.token = token;
    }
}

// Storage adapters
export class MemoryStorage {
    constructor() {
        this.data = new Map();
    }

    async get(key) {
        return this.data.get(key) || null;
    }

    async set(key, value) {
        this.data.set(key, value);
    }

    async remove(key) {
        this.data.delete(key);
    }
}

export class BrowserStorage {
    constructor(type = 'localStorage') {
        this.storage = type === 'sessionStorage' ? sessionStorage : localStorage;
    }

    async get(key) {
        return this.storage.getItem(key);
    }

    async set(key, value) {
        this.storage.setItem(key, value);
    }

    async remove(key) {
        this.storage.removeItem(key);
    }
}

export class CookieStorage {
    async get(key) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${key}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    async set(key, value, options = {}) {
        const {
            maxAge = 31536000,
            path = '/',
            sameSite = 'None',
            secure = true
        } = options;

        let cookie = `${key}=${value}; path=${path}`;
        if (maxAge) cookie += `; max-age=${maxAge}`;
        if (sameSite) cookie += `; SameSite=${sameSite}`;
        if (secure) cookie += `; Secure`;

        document.cookie = cookie;
    }

    async remove(key) {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
}