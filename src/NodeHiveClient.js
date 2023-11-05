import { buildQueryString } from './utils.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

/**
 * This class provides methods to interact with a NodeHive/Drupal JSON:API.
 */
export class NodeHiveClient {
    baseUrl;

    /**
     * Instantiates a new NodeHive client.
     *
     * const nodehive = new NodeHive(baseUrl)
     *
     * @param {baseUrl} baseUrl The baseUrl of your Drupal site.
     * @param {options} options Options for the client.
     */
    constructor(baseUrl, options = {}) {
        if (!baseUrl || typeof baseUrl !== "string") {
            throw new Error("The 'baseUrl' param is required.");
        }
        this.baseUrl = baseUrl;
        this.options = options;
    }

    /**
     * Makes a request to the Drupal JSON:API.
     * @param {string} endpoint - The API endpoint (e.g., '/node/article').
     * @param {string} [method='GET'] - The HTTP method (e.g., 'GET', 'POST').
     * @param {object} [data=null] - The data to be sent with the request.
     * @param {object} [additionalHeaders={}] - Additional headers for the request.
     * @returns {Promise<any>} - The JSON response from the API.
     * @throws Will throw an error if the request fails.
     */
    async request(endpoint, method = 'GET', data = null, additionalHeaders = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(url);
        const headers = {
            'Content-Type': 'application/vnd.api+json',
            ...additionalHeaders
        };

        const config = {
            method,
            headers,
            credentials: 'same-origin'
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Request failed', error);
            throw error;
        }
    }

    /**
     * Retrieves all available content types from the Drupal JSON:API.
     * @returns {Promise<any>} - A Promise that resolves to the list of content types.
     */
    async getContentTypes() {
        // Construct the endpoint URL for retrieving content types
        const endpoint = `/jsonapi/node_type/node_type`;

        // Make the GET request to the Drupal JSON:API
        return this.request(endpoint, 'GET');
    }

    /**
     * Retrieves a list of nodes from the Drupal JSON:API.
     * @param {string} contentType - The content type to interact with.
     * @param {DrupalJsonApiParams} params - DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the list of nodes.
     */
    async getNodes(contentType, params = null) {
        // Initialize an empty query string
        let queryString = '';

        // Build the query string if params are provided and are an instance of DrupalJsonApiParams
        if (params instanceof DrupalJsonApiParams) {
            queryString = '?' + buildQueryString(params);
        }
        return this.request(`/jsonapi/node/${contentType}${queryString}`, 'GET');
    }

    /**
     * Retrieves a single node by its UUID from the Drupal JSON:API.
     * @param {string} uuid - The unique identifier for the node.
     * @param {string} contentType - The content type of the node.
     * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the node data.
     */
    async getNode(uuid, contentType, params = null) {
        // Initialize an empty query string
        let queryString = '';

        // Build the query string if params are provided and are an instance of DrupalJsonApiParams
        if (params instanceof DrupalJsonApiParams) {
            queryString = '?' + buildQueryString(params);
        }

        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/node/${contentType}/${uuid}${queryString}`;

        // Make the GET request to the Drupal JSON:API
        return this.request(endpoint, 'GET');
    }

    async router(slug) {
        // Build the JSON API URL based on the slug array
        const jsonApiUrl = '/router/translate-path?path=' + slug + '/?format=json_api';

        try {
            // Fetch the data from the API URL
            return this.request(jsonApiUrl.toString());

        } catch (error) {
            // Log the error
            console.error(error);

            // If there was an error, return to the 404 page
            notFound();
        }
    }

    async getResourceBySlug(slug) {
        route = this.router(slug)
        return this.request(route.jsonapi.individual, 'GET');
    }

}