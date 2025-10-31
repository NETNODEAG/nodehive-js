import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { NetworkError, ValidationError, ConfigurationError } from './errors.js';
import { AuthManager } from './auth.js';
import { MemoryStorage } from './auth/storage/MemoryStorage.js';
import { BrowserStorage } from './auth/storage/BrowserStorage.js';
import { CookieStorage } from './auth/storage/CookieStorage.js';

// Import method modules
import * as contentMethods from './methods/content.js';
import * as menuMethods from './methods/menu.js';
import * as taxonomyMethods from './methods/taxonomy.js';
import * as mediaMethods from './methods/media.js';
import * as textMethods from './methods/text.js';
import * as fragmentMethods from './methods/fragment.js';
import * as paragraphMethods from './methods/paragraph.js';
import * as routerMethods from './methods/router.js';
import * as batchMethods from './methods/batch.js';

/**
 * NodeHive client for interacting with NodeHive/Drupal JSON:API
 */
export class NodeHiveClient {
    /**
     * Create a new NodeHive client
     * @param {Object|string} options - Configuration options or base URL (for backwards compatibility)
     * @param {string} options.baseUrl - The base URL of your Drupal site
     * @param {Object} options.config - NodeHive configuration
     * @param {boolean} options.debug - Enable debug logging
     * @param {string} options.defaultLanguage - Default language for requests
     * @param {Object} options.auth - Authentication configuration
     * @param {string} options.auth.method - Authentication method: 'oauth' (default), 'jwt', or 'nodehive-api-key'
     * @param {string} options.auth.apiKey - NodeHive API Key (simplest method for server-to-server)
     * @param {string} options.auth.token - Bearer token for authentication
     * @param {Object} options.auth.oauth - OAuth configuration
     * @param {string} options.auth.oauth.grantType - OAuth grant type: 'password' (default) or 'client_credentials'
     * @param {string} options.auth.oauth.clientId - OAuth client ID
     * @param {string} options.auth.oauth.clientSecret - OAuth client secret
     * @param {string} options.auth.oauth.scope - OAuth scope (optional, for client_credentials)
     * @param {Object} options.auth.storage - Storage adapter for auth persistence
     * @param {Object} options.auth.session - Session configuration
     * @param {number} options.auth.session.tokenMaxAge - Max age for storing the auth token (in seconds)
     * @param {number} options.auth.session.refreshTokenMaxAge - Max age for storing the refresh token (in seconds)
     * @param {number} options.timeout - Request timeout in milliseconds
     * @param {Object} options.cache - Cache configuration
     * @param {Object} options.retry - Retry configuration
     * @param {Function[]} options.interceptors - Request/response interceptors
     * @param {Object} legacyConfig - Legacy configuration (deprecated)
     * @param {Object} legacyOptions - Legacy options (deprecated)
     */
    constructor(options, legacyConfig = {}, legacyOptions = {}) {
        // Backwards compatibility: handle old constructor signature
        if (typeof options === 'string') {
            console.warn('Deprecated: Use new NodeHiveClient({ baseUrl: "..." }) instead of NodeHiveClient("...")');
            options = {
                baseUrl: options,
                config: legacyConfig,
                ...legacyOptions
            };
        }

        // Validate required options
        if (!options?.baseUrl) {
            throw new ConfigurationError('baseUrl is required');
        }

        // Initialize configuration
        this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.config = options.config || {};
        this.debug = options.debug || false;
        this.defaultLanguage = options.defaultLanguage || null;
        this.timeout = options.timeout || 30000;
        this.cache = options.cache || null;
        this.retry = {
            enabled: options.retry?.enabled ?? true,
            maxAttempts: options.retry?.maxAttempts || 3,
            delay: options.retry?.delay || 1000,
            ...options.retry
        };

        // Initialize interceptors
        this.interceptors = {
            request: [],
            response: []
        };
        if (options.interceptors) {
            options.interceptors.forEach(interceptor => {
                if (interceptor.request) this.interceptors.request.push(interceptor.request);
                if (interceptor.response) this.interceptors.response.push(interceptor.response);
            });
        }

        // Initialize authentication manager
        const storageAdapter = this._createStorageAdapter(options.auth?.storage);
        const authConfig = {
            method: options.auth?.method,
            oauth: options.auth?.oauth,
            apiKey: options.auth?.apiKey,
            session: {
              tokenMaxAge: options.auth?.session?.tokenMaxAge,
              refreshTokenMaxAge: options.auth?.session?.refreshTokenMaxAge,
            }
        };
        this.auth = new AuthManager(this, storageAdapter, authConfig);

        // Set initial token if provided
        if (options.auth?.token) {
            this.auth.setToken(options.auth.token);
        }

        // Bind auth methods for convenience
        this.login = this.auth.login.bind(this.auth);
        this.logout = this.auth.logout.bind(this.auth);
        this.isLoggedIn = this.auth.isLoggedIn.bind(this.auth);
        this.hasValidSession = this.auth.hasValidSession.bind(this.auth);
        this.getToken = this.auth.getToken.bind(this.auth);
        this.getUserDetails = this.auth.getUserDetails.bind(this.auth);
        this.refreshToken = this.auth.refreshToken.bind(this.auth);

        // Bind all API methods
        this._bindMethods();
    }

    /**
     * Bind all API methods from method modules
     */
    _bindMethods() {
        // Content methods
        this.getContentTypes = (...args) => contentMethods.getContentTypes(this, ...args);
        this.getNodes = (...args) => contentMethods.getNodes(this, ...args);
        this.getNode = (...args) => contentMethods.getNode(this, ...args);
        this.getResourceBySlug = (...args) => contentMethods.getResourceBySlug(this, ...args);

        // Menu methods
        this.getAvailableMenus = (...args) => menuMethods.getAvailableMenus(this, ...args);
        this.getMenus = (...args) => menuMethods.getMenus(this, ...args);
        this.getMenuItems = (...args) => menuMethods.getMenuItems(this, ...args);
        this.getMenuLinks = (...args) => menuMethods.getMenuLinks(this, ...args);
        this.getMenuTree = (...args) => menuMethods.getMenuTree(this, ...args);
        this.getMenu = (...args) => menuMethods.getMenu(this, ...args);

        // Taxonomy methods
        this.getTaxonomyVocabularies = (...args) => taxonomyMethods.getTaxonomyVocabularies(this, ...args);
        this.getTaxonomyTerms = (...args) => taxonomyMethods.getTaxonomyTerms(this, ...args);
        this.getTaxonomyTerm = (...args) => taxonomyMethods.getTaxonomyTerm(this, ...args);
        this.getTaxonomies = (...args) => taxonomyMethods.getTaxonomies(this, ...args); // deprecated

        // Media methods
        this.getMedia = (...args) => mediaMethods.getMedia(this, ...args);
        this.getMediaList = (...args) => mediaMethods.getMediaList(this, ...args);
        this.getMedias = (...args) => mediaMethods.getMedias(this, ...args); // deprecated

        // Text methods
        this.getTexts = (...args) => textMethods.getTexts(this, ...args);
        this.getText = (...args) => textMethods.getText(this, ...args);

        // Fragment methods
        this.getFragment = (...args) => fragmentMethods.getFragment(this, ...args);
        this.getArea = (...args) => fragmentMethods.getArea(this, ...args);

        // Paragraph methods
        this.getParagraph = (...args) => paragraphMethods.getParagraph(this, ...args);

        // Router methods
        this.router = (...args) => routerMethods.router(this, ...args);
        this.getRouteByPath = (...args) => routerMethods.getRouteByPath(this, ...args);
        this.translatePath = (...args) => routerMethods.translatePath(this, ...args);
        this.getPathAliases = (...args) => routerMethods.getPathAliases(this, ...args);
        this.getRedirects = (...args) => routerMethods.getRedirects(this, ...args);
        this.getRedirect = (...args) => routerMethods.getRedirect(this, ...args);
        this.getTranslatedPaths = (...args) => routerMethods.getTranslatedPaths(this, ...args);

        // Batch methods
        this.batch = (...args) => batchMethods.batch(this, ...args);
        this.paginate = (...args) => batchMethods.paginate(this, ...args);
    }

    /**
     * Create storage adapter based on configuration
     */
    _createStorageAdapter(storageConfig) {
        if (!storageConfig) return new MemoryStorage();

        switch (storageConfig.type) {
            case 'localStorage':
            case 'sessionStorage':
                if (typeof window !== 'undefined') {
                    return new BrowserStorage(storageConfig.type);
                }
                return new MemoryStorage();
            case 'cookie':
                if (typeof document !== 'undefined') {
                    return new CookieStorage();
                }
                return new MemoryStorage();
            case 'custom':
                return storageConfig.adapter;
            default:
                return new MemoryStorage();
        }
    }

    /**
     * Make an HTTP request with interceptors, retries, and error handling
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            data = null,
            headers = {},
            lang = null,
            skipInterceptors = false,
            retryCount = 0
        } = options;

        // Build URL
        const langPrefix = lang || this.defaultLanguage;
        const path = langPrefix ? `/${langPrefix}${endpoint}` : endpoint;
        const url = `${this.baseUrl}${path}`;

        // Prepare request config
        let requestConfig = {
            method,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                ...headers,
            },
            next: { revalidate: 300 },
            redirect: 'follow',
        };

        // Add timeout support
        if (this.timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            requestConfig.signal = controller.signal;
            requestConfig.timeoutId = timeoutId;
        }

        // Automatically authenticate client credentials if needed
        let token = await this.auth.getToken();
        if (!token && this.auth.isClientCredentialsGrant()) {
          await this.auth.login();
          token = await this.auth.getToken();
        }

        // Add authentication
        if (token) {
            requestConfig.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add body if needed
        if (data) {
            requestConfig.body = JSON.stringify(data);
        }

        // Apply request interceptors
        if (!skipInterceptors) {
            for (const interceptor of this.interceptors.request) {
                requestConfig = await interceptor(requestConfig, { url, client: this });
            }
        }

        // Debug logging
        if (this.debug) {
            console.log('--- NodeHive Request Debug ---');
            console.log('URL:', url);
            const debugConfig = { ...requestConfig };
            delete debugConfig.signal;
            delete debugConfig.timeoutId;
            console.log('Config:', JSON.stringify(debugConfig, null, 2));
            console.log('--- End Debug ---');
        }

        try {
            const response = await fetch(url, requestConfig);

            // Clear timeout
            if (requestConfig.timeoutId) {
                clearTimeout(requestConfig.timeoutId);
            }

            // Check response
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));

                // Handle OAuth token expiration (401 Unauthorized)
                if (response.status === 401 && this.auth.authMethod === 'oauth' && retryCount === 0) {
                    try {
                        // Attempt to refresh the token
                        await this.auth.refreshToken();

                        // Retry the request with the new token
                        return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
                    } catch (refreshError) {
                        // If refresh fails, throw the original 401 error
                        if (this.debug) {
                            console.log('Token refresh failed:', refreshError.message);
                        }
                    }
                }

                const error = new NetworkError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    errorBody,
                    url
                );

                // Retry logic
                if (this.retry.enabled && retryCount < this.retry.maxAttempts - 1) {
                    const shouldRetry = [408, 429, 500, 502, 503, 504].includes(response.status);
                    if (shouldRetry) {
                        await new Promise(resolve => setTimeout(resolve, this.retry.delay * (retryCount + 1)));
                        return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
                    }
                }

                throw error;
            }

            let responseData = await response.json();

            // Apply response interceptors
            if (!skipInterceptors) {
                for (const interceptor of this.interceptors.response) {
                    responseData = await interceptor(responseData, { response, url, client: this });
                }
            }

            return responseData;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new NetworkError('Request timeout', 408, null, url);
            }
            if (error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError(`Network request failed: ${error.message}`, 0, null, url);
        }
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
        return () => {
            const index = this.interceptors.request.indexOf(interceptor);
            if (index > -1) this.interceptors.request.splice(index, 1);
        };
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
        return () => {
            const index = this.interceptors.response.indexOf(interceptor);
            if (index > -1) this.interceptors.response.splice(index, 1);
        };
    }

    /**
     * Apply configuration to params object
     */
    _applyConfigToParams(params, entityType) {
        if (!params || !entityType) return;

        const typeConfig = this.config?.entities?.[entityType];
        if (!typeConfig) return;

        if (typeConfig.addFilter) {
            typeConfig.addFilter.forEach(filter => params.addFilter(filter));
        }

        if (typeConfig.addFields) {
            typeConfig.addFields.forEach(field => params.addFields(entityType, [field]));
        }

        if (typeConfig.addInclude) {
            typeConfig.addInclude.forEach(include => params.addInclude([include]));
        }
    }

    /**
     * Build query string from params
     */
    _buildQueryString(params) {
        if (!params) return '';

        // Handle string - show helpful error
        if (typeof params === 'string') {
            throw new ValidationError(
                'params should be a DrupalJsonApiParams object or plain object, not a string. ' +
                'Remove .getQueryString() and pass the params object directly.',
                'params',
                params
            );
        }

        // Handle DrupalJsonApiParams object or any object with getQueryString method
        if (typeof params.getQueryString === 'function') {
            return params.getQueryString({ encode: false });
        }

        // Handle plain object (convert to URLSearchParams)
        if (typeof params === 'object' && params !== null) {
            return new URLSearchParams(params).toString();
        }

        throw new ValidationError(
            'params must be a DrupalJsonApiParams object or a plain object',
            'params',
            params
        );
    }

    // ===== Taxonomy Methods (implemented in methods/taxonomy.js) =====

    // ===== Backwards Compatibility Methods =====

    /**
     * Get JWT access token
     * @deprecated Use auth.login() instead
     */
    async getJWTAccessToken(email, password) {
        console.warn('Deprecated: Use auth.login() instead of getJWTAccessToken()');
        try {
            const result = await this.auth.login(email, password);
            return { data: result.token, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    // Legacy cookie methods for backwards compatibility
    storeUserDetails() {
        console.warn('Deprecated: User details are now handled automatically');
    }

    clearUserDetails() {
        console.warn('Deprecated: Use logout() instead');
        this.logout();
    }

    getCookie(name) {
        console.warn('Deprecated: Cookie access is now handled internally');
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    getAllCookieData() {
        console.warn('Deprecated: Cookie access is now handled internally');
        if (typeof document === 'undefined') return {};
        const cookies = document.cookie.split('; ');
        const cookieData = {};
        cookies.forEach(cookie => {
            const [key, value] = cookie.split('=');
            cookieData[key] = value;
        });
        return cookieData;
    }

    hasRole() {
        console.warn('Deprecated: Implement role checking in your application');
        return false;
    }

    decodeJwt(token) {
        console.warn('Deprecated: JWT decoding is now handled internally');
        return this.auth.decodeJwt(token);
    }

    fetchUserDetails(token) {
        console.warn('Deprecated: User details fetching is now handled internally');
        return this.auth.fetchUserDetails(token);
    }
}
