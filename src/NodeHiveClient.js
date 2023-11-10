import { buildQueryString } from './utils.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

/**
 * This class provides methods to interact with a NodeHive/Drupal JSON:API.
 */
export class NodeHiveClient {
    baseUrl;
    config;


    /**
     * Instantiates a new NodeHive client.
     *
     * const nodehive = new NodeHive(baseUrl)
     *
     * @param {baseUrl} baseUrl The baseUrl of your Drupal site.
     * @param {options} options Options for the client.
     */
    constructor(baseUrl, config, options = {}) {
        if (!baseUrl || typeof baseUrl !== "string") {
            throw new Error("The 'baseUrl' param is required.");
        }
        this.baseUrl = baseUrl;
        this.options = options;
        this.config = config;
    }

    async register() {

    }

    async login() {

    }

    async forgotPassword() {

    }

    async hasValidSession() {

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
     * Retrieves all available menus from the Drupal JSON:API.
     * @returns {Promise<any>} - A Promise that resolves to the list of available menus.
     */
    async getAvailableMenus() {
        // Construct the endpoint URL for retrieving menus
        const endpoint = `/jsonapi/menu/menu`;

        // Make the GET request to the Drupal JSON:API
        return this.request(endpoint, 'GET');
    }

    /**
     * Retrieves menu items by menu id from the Drupal JSON:API.
     * @param {string} menuId - The unique identifier for the menu.
     * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the menu items data.
     */
    async getMenuItems(menuId) {
        // Initialize an empty query string
        const apiParams = new DrupalJsonApiParams();

        apiParams
            .addFilter('status', '1')
            .addFields('menu_link_content--menu_link_content', [
                'title',
                'url',
                'enabled',
                'menu_name',
                'external',
                'options',
                'weight',
                'expanded',
                'parent',
            ])
            .getQueryObject();

        const queryString = apiParams.getQueryString();
        // Construct the endpoint URL using the menu id
        const endpoint = `/jsonapi/menu_items/${menuId}?${queryString}&jsonapi_include=1`;

        // Make the GET request to the Drupal JSON:API
        return this.request(endpoint, 'GET');
    }

    /**
     * Retrieves a list of nodes from the Drupal JSON:API.
     * @param {string} contentType - The content type to interact with.
     * @param {DrupalJsonApiParams} params - DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the list of nodes.
     */
    async getNodes(contentType, lang = null, params = new DrupalJsonApiParams()) {
        // Initialize an empty query string
        let queryString = '';

        if (this.config.nodes.contentType) {
            this.config.nodes.contentType.include.map((item) => {
                console.log('addinclude', item)
                params.addInclude(item.value)
            })
        }

        // Build the query string if params are provided and are an instance of DrupalJsonApiParams
        if (params instanceof DrupalJsonApiParams) {
            queryString = '?' + buildQueryString(params);
        }



        if (lang) {
            return this.request(`/${lang}/jsonapi/node/${contentType}${queryString}`, 'GET');
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
    async getNode(uuid, contentType, lang = null, params = new DrupalJsonApiParams()) {
        // Initialize an empty query string
        let queryString = '';
        
        const type = 'node-' + contentType;
        
        if (this.config.entities[type]) {
            // If 'addFields' property exists, iterate over its items
            if (this.config.entities[type].addFields) {
                this.config.entities[type].addFields.forEach(field => {
                    console.log('addField', field);
                    //params.addField(field)
                });
            }
        
            // If 'addInclude' property exists, iterate over its items
            if (this.config.entities[type].addInclude) {
                this.config.entities[type].addInclude.forEach(include => {
                    console.log('addInclude', include);
                    params.addInclude([include])
                });
            }
        }

        
        
        
        queryString = '?' + params.getQueryString({ encode: false });
        

        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/node/${contentType}/${uuid}${queryString}`;
        console.log(endpoint)

        if (lang) {
            return this.request(`/${lang}${endpoint}`, 'GET');
        }

        return this.request(endpoint, 'GET');
    }

    async router(slug, lang = null) {
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

    async getResourceBySlug(slug, lang = null) {

        try {
            const response = await this.router(slug)
            console.log('buuu', response)

            const response2 = await this.getNode(response.entity.uuid, response.entity.bundle, lang)
            return response2
        } catch (error) {
            console.error(error);
        }
    }



}