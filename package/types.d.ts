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
export interface LoginResult {
    success: boolean;
    token: string;
    user: any;
}

export interface UserDetails {
    uid: string;
    email: string;
    [key: string]: any;
}

export class AuthManager {
    constructor(client: NodeHiveClient, storageAdapter?: StorageAdapter);
    login(email: string, password: string): Promise<LoginResult>;
    logout(): Promise<void>;
    getToken(): Promise<string | null>;
    getUserDetails(): Promise<UserDetails | null>;
    isLoggedIn(): Promise<boolean>;
    hasValidSession(): Promise<boolean>;
    fetchUserDetails(token: string): Promise<any>;
    decodeJwt(token: string): any;
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

export interface AuthOptions {
    token?: string;
    storage?: StorageOptions;
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
    login(email: string, password: string): Promise<LoginResult>;
    logout(): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    hasValidSession(): Promise<boolean>;
    getToken(): Promise<string | null>;
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
        StorageAdapter,
        MemoryStorage,
        BrowserStorage,
        CookieStorage,
        ApiResponse,
        RedirectData,
        RequestOptions,
        LoginResult,
        UserDetails
    };
}