import { buildQueryString } from './utils.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

/**
 * This class provides methods to interact with a NodeHive/Drupal JSON:API.
 */
export class NodeHiveClient {
    baseUrl;
    nodehiveconfig;
    options;

    /**
     * Instantiates a new NodeHive client.
     *
     * const nodehive = new NodeHive(baseUrl)
     *
     * @param {baseUrl} baseUrl The baseUrl of your Drupal site.
     * @param {options} options Options for the client.
     */
    constructor(baseUrl, nodehiveconfig = {}, options = {}) {
        if (!baseUrl || typeof baseUrl !== "string") {
            throw new Error("The 'baseUrl' param is required.");
        }
        this.baseUrl = baseUrl;
        this.nodehiveconfig = nodehiveconfig;
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
        console.log('DEBUG URL', url);
        const headers = {
            'Content-Type': 'application/vnd.api+json',
            ...additionalHeaders
        };
        console.log('mytoken', this.options.token);
        if (this.options.token) {
            headers['Authorization'] = `Bearer ${this.options.token}`;
        }

        const config = {
            method,
            headers,
            //credentials: 'same-origin',
            next: { revalidate: 1 },
            cache: 'no-store'
            //cache: 'force-cache'
        };

        console.log('config', config)



        if (data) {
            config.body = JSON.stringify(data);
        }

        //console.log('config:', config);

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const response_body = await response.json()
                console.log('Response Body', response_body)
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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
        try {
            if (!contentType || typeof contentType !== 'string') {
                throw new Error('Invalid content type');
            }

            let queryString = '';

            if (this.nodehiveconfig?.entities[contentType]) {
                this.nodehiveconfig.nodes.contentType.include.forEach((item) => {
                    console.log('addinclude', item)
                    params.addInclude(item.value)
                });
            }

            if (params instanceof DrupalJsonApiParams) {
                queryString = '?' + buildQueryString(params);
            }

            const url = lang
                ? `/${lang}/jsonapi/node/${contentType}${queryString}`
                : `/jsonapi/node/${contentType}${queryString}`;

            return await this.request(url, 'GET');
        } catch (error) {
            console.error('Error in getNodes:', error);
        }
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

        if (this.nodehiveconfig.entities[type]) {
            // If 'addFilter' property exists, iterate over its items
            if (this.nodehiveconfig.entities[type].addFilter) {
                this.nodehiveconfig.entities[type].addFilter.forEach(field => {
                    //console.log('addField', field);
                    params.addFilter('status', 1)
                });
            }

            // If 'addFields' property exists, iterate over its items
            if (this.nodehiveconfig.entities[type].addFields) {
                this.nodehiveconfig.entities[type].addFields.forEach(field => {
                    //console.log('addField', field);
                    params.addFields(type, [field])
                });
            }

            // If 'addInclude' property exists, iterate over its items
            if (this.nodehiveconfig.entities[type].addInclude) {
                this.nodehiveconfig.entities[type].addInclude.forEach(include => {
                    console.log('addInclude', include);
                    params.addInclude([include])
                });
            }
        }




        queryString = '?' + params.getQueryString({ encode: false });


        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/node/${contentType}/${uuid}${queryString}&jsonapi_include=1`;

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
            console.log('Response getResourceBySlug', response)

            const response2 = await this.getNode(response.entity.uuid, response.entity.bundle, lang)
            return response2
        } catch (error) {
            console.error(error);
        }
    }



    /**
     * Stores the current user's token and details in a cookie.
     *
     * @param {string} token
     * @param {object} userDetails
     */
    storeUserDetails(token, userDetails) {
        document.cookie = `userToken=${token}; path=/; max-age=31536000; SameSite=None; Secure`; // 86400 seconds = 1 day
        document.cookie = `userDetails=${JSON.stringify(
            userDetails
        )}; path=/; max-age=31536000; SameSite=None; Secure`;
    }

    /**
     * Clears the current user's token and details from cookies.
     */
    clearUserDetails() {
        document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userDetails=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    /**
     * Retrieves the stored token from cookies.
     *
     * @return {string|null}
     */
    getToken() {
        return this.getCookie('userToken');
    }

    /**
     * Retrieves the stored user details from cookies.
     *
     * @return {object|null}
     */
    getUserDetails() {
        const userDetails = this.getCookie('userDetails');
        return userDetails ? JSON.parse(userDetails) : null;
    }

    /**
     * Utility function to get a cookie by name.
     *
     * @param {string} name
     * @return {string|null}
     */
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    /**
     * Login user and store token and details.
     *
     * @param {string} email
     * @param {string} password
     * @return {Promise}
     */
    async login(email, password) {
        try {
            const loginData = Buffer.from(`${email}:${password}`).toString('base64');
            const response = await fetch(
                this.baseUrl + `/jwt/token?_format=json`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${loginData}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('JWT Token:', data.token);

                this.storeUserDetails(data.token, { email }); // Assuming email as user detail for simplicity

                // Fetch additional user details
                const userDetails = await this.fetchUserDetails(data.token);
                console.log(userDetails);
                this.storeUserDetails(data.token, userDetails); // Store all user details

                return true;
            } else {
                throw new Error('Unknown username or bad password');
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }

    /**
     * Logout user by clearing stored token and details.
     */
    logout() {
        this.clearUserDetails();
    }

    isLoggedIn() {
        const token = this.getCookie('userToken');
        return !!token; // Returns true if token exists, false otherwise
    }

    async fetchUserDetails(token) {
        // Decode JWT and log the data
        const decodedJwt = this.decodeJwt(token);
        console.log('Decoded JWT Data:', decodedJwt.drupal.uid);

        const response = await fetch(
            this.baseUrl + `/user/` +
            decodedJwt.drupal.uid +
            `?_format=json`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.ok) {
            console.log(response)
            return await response.json();
        } else {
            // Handle errors or return default values
            return {};
        }
    }

    /**
     * Check if user is logged in and has a valid session.
     *
     * @return {Promise<boolean>}
     */
    async hasValidSession() {
        try {
            const token = this.getToken();
            if (!token) return false;

            const sessionActive = await fetch(
                this.baseUrl + `/user/login_status?_format=json`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const sessionData = await sessionActive.json();
            return sessionData === 1;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error decoding JWT', e);
            return null;
        }
    }

    /**
     * Checks user role and permissions.
     *
     * @param {string} role
     * @return {boolean}
     */
    hasRole(role) {
        const userDetails = this.getUserDetails();
        // Implement role checking logic here based on your application's requirements
        // Example: return userDetails?.role === role;
    }

    getAllCookieData() {
        const cookies = document.cookie.split('; ');
        const cookieData = {};
        cookies.forEach((cookie) => {
            const [key, value] = cookie.split('=');
            cookieData[key] = value;
        });
        return cookieData;
    }


}