import { DrupalJsonApiParams } from "drupal-jsonapi-params";

// ===== Error Types =====
export class NodeHiveError extends Error {
    code: string;
    details: Record<string, any>;
    timestamp: string;
}

export class NetworkError extends NodeHiveError {
    status: number;
    response: any;
    url: string;
}

export class AuthenticationError extends NodeHiveError {}
export class ValidationError extends NodeHiveError {
    field?: string;
    value?: any;
}
export class ConfigurationError extends NodeHiveError {}

// ===== Storage Types =====
export interface StorageAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}

export class MemoryStorage implements StorageAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}

export class BrowserStorage implements StorageAdapter {
    constructor(type?: 'localStorage' | 'sessionStorage');
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}

export class CookieStorage implements StorageAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: CookieOptions): Promise<void>;
    remove(key: string): Promise<void>;
}

export interface CookieOptions {
    maxAge?: number;
    path?: string;
    sameSite?: 'None' | 'Lax' | 'Strict';
    secure?: boolean;
}

// ===== Auth Types =====
/**
 * Login result from authentication methods
 */
export interface LoginResult {
    success: boolean;
    token: string;
    /**
     * Authentication method used
     */
    method?: 'nodehive-api-key' | 'oauth' | 'jwt';
    /**
     * User details (may not be available for all methods)
     */
    user?: any;
    /**
     * OAuth refresh token (OAuth only)
     */
    refresh_token?: string;
    /**
     * Token expiration in seconds (OAuth only)
     */
    expires_in?: number;
    /**
     * Token type (usually 'Bearer')
     */
    token_type?: string;
    /**
     * OAuth scope granted
     */
    scope?: string;
}

export interface UserDetails {
    uid?: string;
    email?: string;
    authenticated?: boolean;
    [key: string]: any;
}

/**
 * Authentication manager for NodeHiveClient
 * Handles multiple authentication methods
 */
export class AuthManager {
    client: NodeHiveClient;
    storage: StorageAdapter;
    token: string | null;
    userDetails: UserDetails | null;
    authMethod: 'nodehive-api-key' | 'oauth' | 'jwt';
    oauthConfig: OAuthConfig;
    apiKey: string | null;

    constructor(client: NodeHiveClient, storageAdapter?: StorageAdapter | null, authConfig?: AuthOptions);

    /**
     * Login with username and password
     * For OAuth or JWT authentication
     */
    login(username: string, password: string, options?: LoginOptions): Promise<LoginResult>;

    /**
     * Authenticate using OAuth Client Credentials Grant
     * For service account / server-to-server authentication
     */
    authenticateClientCredentials(options?: LoginOptions): Promise<LoginResult>;

    /**
     * Refresh OAuth access token
     */
    refreshToken(): Promise<LoginResult>;

    /**
     * Logout and clear stored credentials
     */
    logout(): Promise<void>;

    /**
     * Get current authentication token
     */
    getToken(): Promise<string | null>;

    /**
     * Get current user details
     */
    getUserDetails(): Promise<UserDetails | null>;

    /**
     * Check if user is logged in
     */
    isLoggedIn(): Promise<boolean>;

    /**
     * Validate current session with server
     */
    hasValidSession(): Promise<boolean>;

    /**
     * Fetch user details from server (JWT)
     */
    fetchUserDetails(token: string): Promise<any>;

    /**
     * Fetch user details from server (OAuth)
     */
    fetchUserDetailsOAuth(token: string): Promise<any>;

    /**
     * Decode JWT token
     */
    decodeJwt(token: string): any;

    /**
     * Set authentication token directly
     */
    setToken(token: string): void;
}

// ===== Configuration Types =====
export interface NodeHiveOptions {
    baseUrl: string;
    config?: NodeHiveConfig;
    debug?: boolean;
    defaultLanguage?: string;
    auth?: AuthOptions;
    timeout?: number;
    cache?: CacheOptions;
    retry?: RetryOptions;
    interceptors?: Interceptor[];
}

export interface NodeHiveConfig {
    entities?: Record<string, EntityConfig>;
}

export interface EntityConfig {
    addFilter?: any[];
    addFields?: string[];
    addInclude?: string[];
}

/**
 * Authentication configuration for NodeHiveClient
 *
 * Supports multiple authentication methods:
 * - NodeHive API Key (recommended - simplest)
 * - OAuth 2.0 Password Grant (user authentication)
 * - OAuth 2.0 Client Credentials (service account)
 * - JWT (legacy)
 */
export interface AuthOptions {
    /**
     * Authentication method to use
     * - 'nodehive-api-key': NodeHive API Key (recommended, simplest)
     * - 'oauth': OAuth 2.0 (default, password or client_credentials grant)
     * - 'jwt': JWT authentication (legacy, deprecated)
     */
    method?: 'nodehive-api-key' | 'oauth' | 'jwt';

    /**
     * NodeHive API Key for simple authentication
     * This is the RECOMMENDED method for server-to-server authentication.
     *
     * @example
     * ```ts
     * auth: {
     *   apiKey: 'nhk_your_api_key_here'
     * }
     * ```
     */
    apiKey?: string;

    /**
     * OAuth 2.0 configuration
     * Supports both Password Grant and Client Credentials Grant
     */
    oauth?: OAuthConfig;

    /**
     * Pre-configured token (for JWT or OAuth)
     * @deprecated Use apiKey or oauth configuration instead
     */
    token?: string;

    /**
     * Storage adapter configuration for tokens
     */
    storage?: StorageOptions;
}

/**
 * OAuth 2.0 configuration
 */
export interface OAuthConfig {
    /**
     * OAuth grant type
     * - 'password': User authentication with username/password
     * - 'client_credentials': Service account / server-to-server
     */
    grantType?: 'password' | 'client_credentials';

    /**
     * OAuth client ID
     */
    clientId?: string;

    /**
     * OAuth client secret
     */
    clientSecret?: string;

    /**
     * OAuth scope (optional)
     */
    scope?: string;
}

/**
 * Login options for different authentication methods
 */
export interface LoginOptions {
    /**
     * OAuth grant type override
     */
    grantType?: 'password' | 'client_credentials';

    /**
     * OAuth client ID override
     */
    clientId?: string;

    /**
     * OAuth client secret override
     */
    clientSecret?: string;

    /**
     * OAuth scope override
     */
    scope?: string;
}

export interface StorageOptions {
    type: 'memory' | 'localStorage' | 'sessionStorage' | 'cookie' | 'custom';
    adapter?: StorageAdapter;
}

export interface CacheOptions {
    enabled?: boolean;
    ttl?: number;
}

export interface RetryOptions {
    enabled?: boolean;
    maxAttempts?: number;
    delay?: number;
}

export interface Interceptor {
    request?: RequestInterceptor;
    response?: ResponseInterceptor;
}

export type RequestInterceptor = (
    config: RequestInit,
    context: { url: string; client: NodeHiveClient }
) => Promise<RequestInit> | RequestInit;

export type ResponseInterceptor = (
    data: any,
    context: { response: Response; url: string; client: NodeHiveClient }
) => Promise<any> | any;

// ===== Request Types =====
export interface RequestOptions {
    method?: string;
    data?: any;
    headers?: Record<string, string>;
    lang?: string | null;
    skipInterceptors?: boolean;
    params?: DrupalJsonApiParams | Record<string, any>;
}

// ===== Response Types =====
export interface ApiResponse<T = any> {
    data?: T;
    included?: any[];
    links?: {
        self?: string;
        next?: string;
        prev?: string;
        first?: string;
        last?: string;
    };
    meta?: Record<string, any>;
    errors?: Array<{
        status?: string;
        source?: { pointer?: string };
        title?: string;
        detail?: string;
    }>;
}

export interface RedirectData {
    from: string;
    to: string;
    status: number;
}

export interface BatchRequest {
    method: string;
    args?: any[];
}

// ===== Main Client Class =====
export class NodeHiveClient {
    baseUrl: string;
    config: NodeHiveConfig;
    debug: boolean;
    defaultLanguage: string | null;
    timeout: number;
    cache: CacheOptions | null;
    retry: RetryOptions;
    auth: AuthManager;
    interceptors: {
        request: RequestInterceptor[];
        response: ResponseInterceptor[];
    };

    // Constructor (supports both new and legacy signatures)
    constructor(options: NodeHiveOptions | string, legacyConfig?: NodeHiveConfig, legacyOptions?: any);

    // Core request method
    request(endpoint: string, options?: RequestOptions): Promise<any>;

    // Interceptor management
    addRequestInterceptor(interceptor: RequestInterceptor): () => void;
    addResponseInterceptor(interceptor: ResponseInterceptor): () => void;

    // ===== Content Methods =====
    getContentTypes(options?: RequestOptions): Promise<ApiResponse>;
    getNodes(contentType: string, options?: RequestOptions): Promise<ApiResponse>;
    getNode(uuid: string, contentType: string, options?: RequestOptions): Promise<ApiResponse>;
    getResourceBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse | null>;

    // ===== Menu Methods =====
    getAvailableMenus(options?: RequestOptions): Promise<ApiResponse>;
    getMenus(options?: RequestOptions): Promise<ApiResponse>;
    getMenuItems(menuId: string, options?: RequestOptions): Promise<ApiResponse>;
    getMenuLinks(menuId: string, options?: RequestOptions): Promise<ApiResponse>;
    getMenuTree(menuId: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Taxonomy Methods =====
    getTaxonomyTerms(vocabularyId: string, options?: RequestOptions): Promise<ApiResponse>;
    getTaxonomyTerm(termId: string, vocabularyId: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Media Methods =====
    getMedia(uuid: string, mediaType: string, options?: RequestOptions): Promise<ApiResponse>;
    getMediaList(mediaType: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Text Methods =====
    getTexts(options?: RequestOptions): Promise<ApiResponse>;
    getText(uuid: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Fragment Methods =====
    getFragment(uuid: string, fragmentType: string, options?: RequestOptions): Promise<ApiResponse>;
    getArea(uuid: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Paragraph Methods =====
    getParagraph(uuid: string, paragraphType: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Router Methods =====
    router(slug: string, options?: RequestOptions): Promise<ApiResponse | null>;
    getRedirect(slug: string, options?: RequestOptions): Promise<RedirectData | null>;
    getTranslatedPaths(slug: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Batch & Pagination =====
    batch(requests: BatchRequest[]): Promise<any[]>;
    paginate(method: string, args?: any[], pageSize?: number): AsyncGenerator<any>;

    // ===== Auth Methods (convenience bindings) =====
    /**
     * Login with username and password
     * Or authenticate using OAuth Client Credentials (no username/password needed)
     *
     * @param email - Username/email (not needed for client_credentials grant)
     * @param password - Password (not needed for client_credentials grant)
     * @param options - Login options (OAuth configuration overrides)
     */
    login(email?: string, password?: string, options?: LoginOptions): Promise<LoginResult>;

    /**
     * Logout and clear authentication
     */
    logout(): Promise<void>;

    /**
     * Check if user is logged in
     */
    isLoggedIn(): Promise<boolean>;

    /**
     * Validate current session with server
     */
    hasValidSession(): Promise<boolean>;

    /**
     * Get current authentication token
     */
    getToken(): Promise<string | null>;

    /**
     * Get current user details
     */
    getUserDetails(): Promise<UserDetails | null>;

    // ===== Deprecated Methods (for backwards compatibility) =====
    /** @deprecated Use getMediaList() instead */
    getMedias(mediaType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

    /** @deprecated Use getTaxonomyTerms() instead */
    getTaxonomies(taxonomyType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

    /** @deprecated Use auth.login() instead */
    getJWTAccessToken(email: string, password: string): Promise<{ data: string | null; error: string | null }>;

    /** @deprecated User details are now handled automatically */
    storeUserDetails(token: string, userDetails: object): void;

    /** @deprecated Use logout() instead */
    clearUserDetails(): void;

    /** @deprecated Cookie access is now handled internally */
    getCookie(name: string): string | null;

    /** @deprecated Cookie access is now handled internally */
    getAllCookieData(): Record<string, string>;

    /** @deprecated Implement role checking in your application */
    hasRole(role: string): boolean;

    /** @deprecated JWT decoding is now handled internally */
    decodeJwt(token: string): any;

    /** @deprecated User details fetching is now handled internally */
    fetchUserDetails(token: string): Promise<any>;
}

// Module declaration for package import
declare module 'nodehive-js' {
    export {
        NodeHiveClient,
        NodeHiveOptions,
        NodeHiveConfig,
        NodeHiveError,
        NetworkError,
        AuthenticationError,
        ValidationError,
        ConfigurationError,
        AuthManager,
        AuthOptions,
        OAuthConfig,
        LoginOptions,
        StorageAdapter,
        MemoryStorage,
        BrowserStorage,
        CookieStorage,
        CookieOptions,
        StorageOptions,
        ApiResponse,
        RedirectData,
        RequestOptions,
        LoginResult,
        UserDetails
    };
}