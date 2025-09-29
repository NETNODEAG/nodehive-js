import { AuthenticationError } from './errors.js';

export class AuthManager {
    constructor(client, storageAdapter = null) {
        this.client = client;
        this.storage = storageAdapter || new MemoryStorage();
        this.token = null;
        this.userDetails = null;
    }

    async login(email, password) {
        try {
            const loginData = Buffer.from(`${email}:${password}`).toString('base64');
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

    async logout() {
        this.token = null;
        this.userDetails = null;
        await this.storage.remove('token');
        await this.storage.remove('userDetails');
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