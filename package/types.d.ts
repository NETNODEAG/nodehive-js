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

export class ApiError extends NodeHiveError {
    error: any;
    response: any;
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
    httpOnly?: boolean;
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
    authConfig: AuthOptions;
    storage: StorageAdapter;
    authMethod: 'nodehive-api-key' | 'oauth' | 'jwt';
    oauthConfig: OAuthConfig;
    apiKey: string | null;
    token: string | null;
    tokenExpiresAt: number | null;
    refreshTokenValue: string | null;
    userDetails: UserDetails | null;
    session: AuthSessionOptions | null;

    constructor(client: NodeHiveClient, storageAdapter?: StorageAdapter | null, authConfig?: AuthOptions);

    /**
     * Login using the configured strategy
     */
    login(username?: string, password?: string, options?: LoginOptions): Promise<LoginResult>;

    /**
     * Exchange an OAuth authorization code for tokens (Authorization Code + PKCE flow)
     */
    exchangeCode(options: ExchangeCodeOptions): Promise<LoginResult>;

    /**
     * Refresh the current access token (if supported by the strategy)
     */
    refreshToken(options?: LoginOptions): Promise<LoginResult>;

    /**
     * Clear all persisted authentication state
     */
    logout(): Promise<void>;

    /**
     * Persist an access token
     */
    setToken(token: string | null, options?: Record<string, any>): Promise<void>;

    /**
     * Read the current access token
     */
    getToken(): Promise<string | null>;

    setTokenExpiresAt(timestamp: number | null): Promise<void>;

    getTokenExpiresAt(): Promise<number | null>;

    setRefreshToken(refreshToken: string | null, options?: Record<string, any>): Promise<void>;

    getRefreshToken(): Promise<string | null>;

    setUserDetails(userDetails: UserDetails | string | null, options?: Record<string, any>): Promise<void>;

    getUserDetails(): Promise<UserDetails | null>;

    isLoggedIn(): Promise<boolean>;

    isTokenExpired(): Promise<boolean>;

    hasValidSession(): Promise<boolean>;

    fetchUserDetails(token: string): Promise<any>;

    decodeJwt(token: string): any;

    isClientCredentialsGrant(): boolean;

    isAuthorizationCodeGrant(): boolean;

    resolveMaxAge(...candidates: Array<number | string | null | undefined>): number | null;
}

// ===== Configuration Types =====
export interface NodeHiveOptions {
    baseUrl: string;
    config?: NodeHiveConfig;
    debug?: boolean;
    defaultLanguage?: string;
    /** Whether the Drupal backend uses language prefixes in API URLs (default: true) */
    multilingual?: boolean;
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
     * Session persistence settings (e.g. cookie max-age overrides)
     */
    session?: AuthSessionOptions;

    /**
     * Storage adapter configuration for tokens
     */
    storage?: StorageOptions;
}

export interface AuthSessionOptions {
    tokenMaxAge?: number;
    refreshTokenMaxAge?: number;
}

/**
 * OAuth 2.0 configuration
 */
export interface OAuthConfig {
    /**
     * OAuth grant type
     * - 'password': User authentication with username/password
     * - 'client_credentials': Service account / server-to-server
     * - 'authorization_code': Authorization Code Flow with PKCE (SSO via IdP redirect)
     */
    grantType?: 'password' | 'client_credentials' | 'authorization_code';

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

    /**
     * Authorize endpoint URL (Authorization Code flow only).
     * Example: https://idp.example.com/oauth/authorize
     */
    authorizeUrl?: string;

    /**
     * Token endpoint URL. Defaults to `{baseUrl}/oauth/token` when omitted.
     */
    tokenUrl?: string;

    /**
     * Default redirect URI for Authorization Code flow. Can be overridden per call
     * (e.g. for multi-domain deployments where the redirect_uri is derived per request).
     */
    redirectUri?: string;
}

/**
 * Login options for different authentication methods
 */
export interface LoginOptions {
    /**
     * OAuth grant type override
     */
    grantType?: 'password' | 'client_credentials' | 'authorization_code';

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

    /**
     * Override for token max-age persistence (seconds)
     */
    tokenMaxAge?: number;

    /**
     * Override for refresh token max-age persistence (seconds)
     */
    refreshTokenMaxAge?: number;
}

/**
 * Options for AuthManager.exchangeCode (Authorization Code + PKCE flow)
 */
export interface ExchangeCodeOptions extends LoginOptions {
    /** Authorization code from the OAuth callback */
    code: string;
    /** PKCE code_verifier matching the code_challenge sent to /oauth/authorize */
    codeVerifier: string;
    /** Redirect URI used for the original /oauth/authorize request (must match exactly) */
    redirectUri: string;
}

/**
 * PKCE primitives for the OAuth 2.0 Authorization Code + PKCE flow.
 */
export interface PKCEPair {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
}

/**
 * Generate a PKCE code_verifier/code_challenge pair using crypto.subtle.
 * Works in both Node (>= 16) and modern browsers.
 */
export function generatePKCE(): Promise<PKCEPair>;

/**
 * Generate a random `state` parameter for the OAuth Authorization Request.
 * Returns 32 random bytes encoded as base64url.
 */
export function generateState(): string;

/**
 * Options for buildAuthorizeUrl.
 */
export interface BuildAuthorizeUrlOptions {
    authorizeUrl: string;
    clientId: string;
    redirectUri: string;
    state: string;
    codeChallenge: string;
    scope?: string;
    codeChallengeMethod?: 'S256';
}

/**
 * Build the /oauth/authorize URL for an OAuth Authorization Code + PKCE redirect.
 */
export function buildAuthorizeUrl(options: BuildAuthorizeUrlOptions): string;

/**
 * OAuth 2.0 Authorization Code + PKCE strategy.
 * Use via AuthManager when oauthConfig.grantType === 'authorization_code'.
 */
export class OAuthAuthorizationCodeStrategy {
    constructor(authManager: AuthManager);
    exchangeCode(options: ExchangeCodeOptions): Promise<LoginResult>;
    refreshToken(options?: LoginOptions): Promise<LoginResult>;
    fetchUserDetails(token: string): Promise<any>;
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

export interface PublicApiEnvelope<T = any> {
    status: 'ok' | 'error';
    data?: T;
    error?: any;
}

export interface PublicApiEndpointMetadata {
    method?: string;
    path?: string;
    description?: string;
    parameters?: Record<string, any>;
    [key: string]: any;
}

export interface PublicApiContentType {
    id?: string;
    label?: string;
    type?: string;
    fields?: Record<string, any>;
    [key: string]: any;
}

export interface PublicApiTag {
    id?: string | number;
    name?: string;
    slug?: string;
    [key: string]: any;
}

export interface PublicApiIndex {
    endpoints?: Record<string, PublicApiEndpointMetadata> | PublicApiEndpointMetadata[];
    content_types?: PublicApiContentType[];
    tags?: PublicApiTag[];
    [key: string]: any;
}

export interface PublicApiMenuItem {
    title: string;
    url: string;
    description?: string | null;
    enabled: boolean;
    expanded: boolean;
    weight: string | number;
    children?: PublicApiMenuItem[];
    [key: string]: any;
}

export interface PublicApiMenu {
    menu_id: string;
    language: string;
    items: PublicApiMenuItem[];
    data?: PublicApiMenuItem[];
    [key: string]: any;
}

export interface JsonApiMenuItem {
    id: string;
    title: string;
    url: string;
    parent: string;
    weight?: number;
    enabled?: boolean;
    expanded?: boolean;
    [key: string]: any;
}

export interface PublicApiSpace {
    id?: string | number;
    uuid?: string;
    title?: string;
    name?: string;
    frontpage_node?: {
        id?: string | number;
        uuid?: string;
        [key: string]: any;
    } | null;
    content_types?: PublicApiContentType[];
    tags?: PublicApiTag[];
    [key: string]: any;
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
    multilingual: boolean;
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
    request<T = any>(endpoint: string, options?: RequestOptions): Promise<T>;

    // Interceptor management
    addRequestInterceptor(interceptor: RequestInterceptor): () => void;
    addResponseInterceptor(interceptor: ResponseInterceptor): () => void;

    // ===== Content Methods =====
    getContentTypes(options?: RequestOptions): Promise<ApiResponse>;
    getNodes(contentType: string, options?: RequestOptions): Promise<ApiResponse>;
    getNode(uuid: string, contentType: string, options?: RequestOptions): Promise<ApiResponse>;
    getResourceBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse | null>;

    // ===== Menu Methods =====
    getMenus(options?: RequestOptions): Promise<ApiResponse>;
    getMenuItems(menuId: string, options?: RequestOptions): Promise<ApiResponse<JsonApiMenuItem[]>>;
    getMenuLinkEntities(menuId: string, options?: RequestOptions): Promise<ApiResponse>;
    /** @deprecated Use getMenuItems() for renderable menu items or getMenuLinkEntities() for raw Drupal entities. */
    getMenuLinks(menuId: string, options?: RequestOptions): Promise<ApiResponse>;
    /** @deprecated Use getMenuItems() instead. This returns a flat list, not a nested tree. */
    getMenuTree(menuId: string, options?: RequestOptions): Promise<ApiResponse>;
    getMenu(menuId: string, options?: RequestOptions): Promise<PublicApiMenu>;

    // ===== NodeHive Public API Methods =====
    getApiIndex(options?: RequestOptions): Promise<PublicApiIndex>;
    getSpace(spaceRef: string, options?: RequestOptions): Promise<PublicApiSpace>;

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
    getFragments(fragmentType: string, options?: RequestOptions): Promise<ApiResponse>;

    // ===== Area Methods =====
    getArea(uuid: string, options?: RequestOptions): Promise<ApiResponse>;
    getAreas(options?: RequestOptions): Promise<ApiResponse>;

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

    /** @deprecated Use getMenus() instead */
    getAvailableMenus(options?: RequestOptions): Promise<ApiResponse>;

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
        ApiError,
        AuthenticationError,
        ValidationError,
        ConfigurationError,
        AuthManager,
        AuthOptions,
        OAuthConfig,
        LoginOptions,
        ExchangeCodeOptions,
        OAuthAuthorizationCodeStrategy,
        PKCEPair,
        BuildAuthorizeUrlOptions,
        generatePKCE,
        generateState,
        buildAuthorizeUrl,
        StorageAdapter,
        MemoryStorage,
        BrowserStorage,
        CookieStorage,
        CookieOptions,
        StorageOptions,
        ApiResponse,
        PublicApiEnvelope,
        PublicApiEndpointMetadata,
        PublicApiContentType,
        PublicApiTag,
        PublicApiMenuItem,
        PublicApiMenu,
        JsonApiMenuItem,
        PublicApiIndex,
        PublicApiSpace,
        RedirectData,
        RequestOptions,
        LoginResult,
        UserDetails
    };
}
