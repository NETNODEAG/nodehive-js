// Import necessary types from external libraries if needed
import { DrupalJsonApiParams } from "drupal-jsonapi-params";

/**
 * Represents the options passed to the NodeHiveClient constructor.
 */
interface NodeHiveOptions {
    token?: string;
    // Add other options as necessary
}

/**
 * Represents the configuration for the NodeHiveClient.
 */
interface NodeHiveConfig {
    entities?: any; // Define more specifically based on your configuration structure
}

/**
 * Represents a generic API response structure. Adjust according to your actual API response structure.
 */
interface ApiResponse<T = any> {
    data: T;
    // Include other standard response properties like 'errors', 'meta', etc., if applicable
}

declare module 'nodehive-js' {
    export class NodeHiveClient {
        constructor(baseUrl: string, nodehiveconfig?: NodeHiveConfig, options?: NodeHiveOptions);

        request(endpoint: string, method?: string, data?: any, additionalHeaders?: Record<string, string>): Promise<ApiResponse>;

        getContentTypes(): Promise<ApiResponse>;

        getAvailableMenus(): Promise<ApiResponse>;

        getMenuItems(menuId: string): Promise<ApiResponse>;

        getNodes(contentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        getNode(uuid: string, contentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        getFragment(uuid: string, fragmentType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        getArea(uuid: string, lang?: string | null): Promise<ApiResponse>;

        getParagraph(uuid: string, paragraphType: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        getTaxonomyTerm(termId: string, vocabularyId: string, lang?: string | null, params?: DrupalJsonApiParams): Promise<ApiResponse>;

        router(slug: string, lang?: string | null): Promise<ApiResponse>;

        getTranslatedPaths(slug: string): Promise<ApiResponse>;

        getResourceBySlug(slug: string, lang?: string | null): Promise<ApiResponse>;

        // Add other methods as necessary
    }
}
