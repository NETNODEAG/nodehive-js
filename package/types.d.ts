import { DrupalJsonApiParams } from "drupal-jsonapi-params";

interface NodeHiveOptions {
    debug?: boolean;
    token?: string;
}

interface NodeHiveConfig {
    entities: Record<string, any>; // Consider specifying a more detailed structure
}

interface ApiResponse<T = any> {
    data: T;
    error?: string;
}

interface UserDetails {
    uid: string;
    email: string;
}

interface RedirectData {
    from: string;
    to: string;
    status: number;
}

// Extend the module declaration to include missing methods
declare module 'nodehive-js' {
    export class NodeHiveClient {
        constructor(baseUrl: string, nodehiveconfig?: NodeHiveConfig, options?: NodeHiveOptions);

        request(endpoint: string, method?: string, data?: any, additionalHeaders?: Record<string, string>): Promise<ApiResponse>;

        getContentTypes(): Promise<ApiResponse>;
        getAvailableMenus(): Promise<ApiResponse>;
        getMenuItems(menuId: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getNodes(contentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getNode(uuid: string, contentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getFragment(uuid: string, fragmentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getArea(uuid: string, lang?: string | null): Promise<ApiResponse>;
        getParagraph(uuid: string, paragraphType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getTaxonomyTerms(vocabularyId: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getTaxonomyTerm(termId: string, vocabularyId: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getTaxonomies(taxonomyType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getMedia(uuid: string, mediaType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;
        getMedias(mediaType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        router(slug: string, lang?: string | null): Promise<ApiResponse>;
        getRedirect(slug: string, lang?: string | null): Promise<RedirectData | null>;

        getTranslatedPaths(slug: string): Promise<ApiResponse>;
        getResourceBySlug(slug: string, lang?: string | null): Promise<ApiResponse>;

        login(email: string, password: string): Promise<boolean>;
        logout(): void;
        isLoggedIn(): boolean;
        hasValidSession(): Promise<boolean>;
        hasRole(role: string): boolean;
        storeUserDetails(token: string, userDetails: object): void;
        clearUserDetails(): void;
        getToken(): string | null;
        getUserDetails(): UserDetails | null;
        getCookie(name: string): string | null;
        decodeJwt(token: string): any; // Consider specifying a more detailed return type
        getAllCookieData(): Record<string, string>;

        getJWTAccessToken(email: string, password: string): Promise<ApiResponse>;
        fetchUserDetails(token: string): Promise<ApiResponse<UserDetails>>;
    }
}
