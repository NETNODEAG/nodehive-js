import { buildQueryString } from "./utils.js";
import { DrupalJsonApiParams } from "drupal-jsonapi-params";

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
    async request(endpoint, method = "GET", data = null, additionalHeaders = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            "Content-Type": "application/vnd.api+json",
            ...additionalHeaders,
        };
        if (this.options.token) {
            headers["Authorization"] = `Bearer ${this.options.token}`;
        }

        const config = {
            method,
            headers,
            //credentials: 'same-origin',
            next: { revalidate: 1 },
            redirect: 'follow',
            //cache: 'force-cache'
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        if (this.options.debug) {
            if (this.options.debug) {
                console.log("--- nodehive-js debug ---");
                console.log("URL:", url);
                console.log("Config:", JSON.stringify(config, null, 2));
                if (this.options) {
                    console.log("Options:", JSON.stringify(this.options, null, 2));
                }
                console.log("--- nodehive-js debug end ---");
            }
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const response_body = await response.json();
                throw new Error(
                    `HTTP error! status: ${response.status} - ${response.statusText}`,
                );
            }
            return await response.json();
        } catch (error) {
            console.error("Request failed", error);
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
        return this.request(endpoint, "GET");
    }

    /**
     * Retrieves all available menus from the Drupal JSON:API.
     * @returns {Promise<any>} - A Promise that resolves to the list of available menus.
     */
    async getAvailableMenus() {
        // Construct the endpoint URL for retrieving menus
        const endpoint = `/jsonapi/menu/menu`;

        // Make the GET request to the Drupal JSON:API
        return this.request(endpoint, "GET");
    }

    /**
   * Retrieves menu items by menu id from the Drupal JSON:API.
   * @param {string} menuId - The unique identifier for the menu.
   * @param {string} [lang=null] - Optional language parameter.
   * @returns {Promise<any>} - A Promise that resolves to the menu items data.
   */
    async getMenuItems(menuId, lang) {
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
        const url = lang ? `/${lang}${endpoint}` : `${endpoint}`;

        // Make the GET request to the Drupal JSON:API
        return this.request(url, 'GET');
    }

    /**
     * Applies the configuration to the params object.
     * @param {Params} params - The params object to apply the configuration to.
     * @param {TypeConfig} typeConfig - The configuration object containing filters, fields, and includes.
     */
    applyConfigToParams(params, typeConfig, type) {
        if (!typeConfig) return;

        if (typeConfig.addFilter) {
            typeConfig.addFilter.forEach((filter) => {
                params.addFilter(filter);
            });
        }

        if (typeConfig.addFields) {
            typeConfig.addFields.forEach((field) => {
                params.addFields(type, [field]);
            });
        }

        if (typeConfig.addInclude) {
            typeConfig.addInclude.forEach((include) => {
                params.addInclude([include]);
            });
        }
    }

    /**
     * Retrieves a list of nodes from the Drupal JSON:API.
     * @param {string} contentType - The content type to interact with.
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} params - DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the list of nodes.
     */
    async getNodes(contentType, lang = null, params = new DrupalJsonApiParams()) {
        try {
            if (!contentType || typeof contentType !== "string") {
                throw new Error("Invalid content type");
            }

            let queryString = "";
            const type = "node-" + contentType;
            const typeConfig = this.nodehiveconfig.entities[type];

            this.applyConfigToParams(params, typeConfig, type);

            if (params instanceof DrupalJsonApiParams) {
                queryString = "?" + buildQueryString(params);
            }

            const url = lang
                ? `/${lang}/jsonapi/node/${contentType}${queryString}&jsonapi_include=1`
                : `/jsonapi/node/${contentType}${queryString}&jsonapi_include=1`;

            return await this.request(url, "GET");
        } catch (error) {
            console.error("Error in getNodes:", error);
        }
    }

    /**
     * Retrieves a single node by its UUID from the Drupal JSON:API.
     * @param {string} uuid - The unique identifier for the node.
     * @param {string} contentType - The content type of the node.
     * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the node data.
     */
    async getNode(
        uuid,
        contentType,
        lang = null,
        params = new DrupalJsonApiParams(),
    ) {
        if (!contentType || typeof contentType !== "string") {
            throw new Error("Invalid content type");
        }

        let queryString = "";
        const type = "node-" + contentType;
        const typeConfig = this.nodehiveconfig.entities[type];

        this.applyConfigToParams(params, typeConfig, type);

        queryString = "?" + params.getQueryString({ encode: false });

        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/node/${contentType}/${uuid}${queryString}&jsonapi_include=1`;

        if (lang) {
            return this.request(`/${lang}${endpoint}`, "GET");
        }

        return this.request(endpoint, "GET");
    }

    /**
     * Retrieves a single fragment by its UUID from the Drupal JSON:API.
     * @param {string} uuid - The unique identifier for the fragment.
     * @param {string} fragmentType - The fragment type of the fragment.
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the node data.
     */
    async getFragment(
        uuid,
        fragmentType,
        lang = null,
        params = new DrupalJsonApiParams()
    ) {


        let queryString = "";
        const type = "nodehive_fragment--" + fragmentType;
        const typeConfig = this.nodehiveconfig.entities[type];

        this.applyConfigToParams(params, typeConfig, type);

        queryString = "?" + params.getQueryString({ encode: false });

        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/nodehive_fragment/${fragmentType}/${uuid}${queryString}&jsonapi_include=1`;

        if (lang) {
            return this.request(`/${lang}${endpoint}`, "GET");
        }

        return this.request(endpoint, "GET");
    }

    /**
     * Retrieves a single area with its fragments by its UUID from the Drupal JSON:API.
     * @param {string} uuid - The unique identifier for the area.
     * @returns {Promise<any>} - A Promise that resolves to the node data.
     */
    async getArea(
        uuid,
        lang = null
    ) {


        // Construct the endpoint URL using the node UUID and content type
        const endpoint = `/jsonapi/nodehive_area/nodehive_area/${uuid}?&jsonapi_include=1&include=fragment_id`;

        if (lang) {
            return this.request(`/${lang}${endpoint}`, "GET");
        }

        return this.request(endpoint, "GET");
    }

    /**
     * Retrieves a specific paragraph by its ID from the Drupal JSON:API.
     * @param {string} paragraphId - The unique identifier for the paragraph.
     * @param {string} paragraphType - The paragraph type (e.g., 'paragraph--p_accordions').
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the paragraph data.
     */
    async getParagraph(
        uuid,
        paragraphType,
        lang = null,
        params = new DrupalJsonApiParams(),
    ) {
        try {
            // Check for valid paragraph type
            if (!paragraphType || typeof paragraphType !== "string") {
                throw new Error("Invalid paragraph type");
            }

            // Apply type configuration
            const type = "paragraph-" + paragraphType;
            const typeConfig = this.nodehiveconfig.entities[type];
            this.applyConfigToParams(params, typeConfig, type);

            const queryString = params.getQueryString();

            let endpoint = `/jsonapi/paragraph/${paragraphType}/${uuid}?${queryString}`;

            // Append language if provided
            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            return await this.request(endpoint, "GET");
        } catch (error) {
            console.error("Error in getParagraph:", error);
        }
    }

    /**
     * Retrieves all taxonomy terms of a specific vocabulary from the Drupal JSON:API.
     * @param {string} vocabularyId - The vocabulary ID of the taxonomy terms.
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional parameters to customize the query, such as filters and pagination.
     * @returns {Promise<any>} - A Promise that resolves to the paragraph data.
     */
    async getTaxonomyTerms(vocabularyId, lang = null, params = new DrupalJsonApiParams()) {
        try {
            // Check for a valid vocabularyId
            if (!vocabularyId || typeof vocabularyId !== 'string') {
                throw new Error('Invalid vocabulary ID');
            }

            // Apply type configuration if available
            const type = `taxonomy_term--${vocabularyId}`;
            const typeConfig = this.nodehiveconfig.entities[type];
            if (typeConfig) {
                this.applyConfigToParams(params, typeConfig, type);
            }

            let queryString = params.getQueryString();

            // Construct the endpoint URL using the vocabulary ID
            let endpoint = `/jsonapi/taxonomy_term/${vocabularyId}?${queryString}`;

            // Append language if provided
            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            // Make the GET request to the Drupal JSON:API
            const response = await this.request(endpoint, 'GET');
            return response.data; // Assuming the JSON:API responds with data in a 'data' key
        } catch (error) {
            console.error('Error in getAllTaxonomyTerms:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }



    /**
    * Retrieves a specific taxonomy term by its ID from the Drupal JSON:API.
    * @param {string} termId - The unique identifier for the taxonomy term.
    * @param {string} vocabularyId - The vocabulary ID of the taxonomy term.
    * @param {string} [lang=null] - Optional language parameter.
    * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional DrupalJsonApiParams to customize the query.
    * @returns {Promise<any>} - A Promise that resolves to the taxonomy term data.
    */
    async getTaxonomyTerm(
        termId,
        vocabularyId,
        lang = null,
        params = new DrupalJsonApiParams()
    ) {
        try {
            // Check for valid termId and vocabularyId
            if (
                !termId ||
                typeof termId !== 'string' ||
                !vocabularyId ||
                typeof vocabularyId !== 'string'
            ) {
                throw new Error('Invalid term ID or vocabulary ID');
            }

            // Apply type configuration if available
            const type = `taxonomy_term--${vocabularyId}`;
            const typeConfig = this.nodehiveconfig.entities[type];
            if (typeConfig) {
                this.applyConfigToParams(params, typeConfig, type);
            }

            let queryString = params.getQueryString();

            // Construct the endpoint URL using the taxonomy term ID and vocabulary ID
            let endpoint = `/jsonapi/taxonomy_term/${vocabularyId}/${termId}?${queryString}`;

            // Append language if provided
            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            // Make the GET request to the Drupal JSON:API
            return await this.request(endpoint, 'GET');
        } catch (error) {
            console.error('Error in getTaxonomyTerm:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

    /** Retrieves a list of taxonomy terms from the Drupal JSON:API.
     * @param {string} taxonomyType - The taxonomy type to interact with.
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the list of taxonomy terms.
     */
    async getTaxonomies(
        taxonomyType,
        lang = null,
        params = new DrupalJsonApiParams()
    ) {
        try {
            // Validate taxonomyType parameter
            if (!taxonomyType || typeof taxonomyType !== 'string') {
                throw new Error('Invalid taxonomy type');
            }

            // Apply configurations from nodehiveconfig if applicable
            const type = 'taxonomy-' + taxonomyType;
            const typeConfig = this.nodehiveconfig.entities[type];
            this.applyConfigToParams(params, typeConfig, type);

            // Construct query string from DrupalJsonApiParams
            const queryString = params.getQueryString({ encode: false });

            // Construct the endpoint URL for fetching taxonomy terms
            let endpoint = `/jsonapi/taxonomy_term/${taxonomyType}`;
            if (queryString) {
                endpoint += `?${queryString}&jsonapi_include=1`;
            } else {
                endpoint += `?jsonapi_include=1`;
            }

            // Prepend language prefix to endpoint if specified
            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            // Make the GET request to the Drupal JSON:API
            return this.request(endpoint, 'GET');
        } catch (error) {
            console.error('Error in getTaxonomies:', error);
        }
    }

    /**
     * Retrieves a specific media item by its UUID from the Drupal JSON:API.
     * @param {string} uuid - The unique identifier for the media item.
     * @param {string} mediaType - The type of media (e.g., 'image', 'video').
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the media data.
     * @throws Will throw an error if the request fails.
     */
    async getMedia(
        uuid,
        mediaType,
        lang = null,
        params = new DrupalJsonApiParams()
    ) {
        try {
            if (!mediaType || typeof mediaType !== 'string') {
                throw new Error('Invalid media type type');
            }

            const queryString = params.getQueryString();

            let endpoint = `/jsonapi/media/${mediaType}/${uuid}?${queryString}&jsonapi_include=1`;

            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            return await this.request(endpoint, 'GET');
        } catch (error) {
            console.error('Error in getMedia:', error);
        }
    }

    /**
     * Retrieves a list of media items by type from the Drupal JSON:API.
     * @param {string} mediaType - The type of media (e.g., 'image', 'video').
     * @param {string} [lang=null] - Optional language parameter.
     * @param {DrupalJsonApiParams} [params=new DrupalJsonApiParams()] - Optional DrupalJsonApiParams to customize the query.
     * @returns {Promise<any>} - A Promise that resolves to the list of media items.
     * @throws Will throw an error if the request fails.
     */
    async getMedias(mediaType, lang = null, params = new DrupalJsonApiParams()) {
        try {
            if (!mediaType || typeof mediaType !== 'string') {
                throw new Error('Invalid media type type');
            }

            const queryString = params.getQueryString();

            let endpoint = `/jsonapi/media/${mediaType}?${queryString}&jsonapi_include=1`;

            if (lang) {
                endpoint = `/${lang}${endpoint}`;
            }

            return await this.request(endpoint, 'GET');
        } catch (error) {
            console.error('Error in getMedia:', error);
        }
    }

    async router(slug, lang = null) {
        // Build the JSON API URL based on the slug array
        const jsonApiUrl = `/router/translate-path?path=/${slug}`;
        const url = lang ? `/${lang}${jsonApiUrl}` : jsonApiUrl;

        try {
            // Fetch the data from the API URL
            return this.request(url.toString());

        } catch (error) {
            // Log the error
            console.error(error);

            // If there was an error, return to the 404 page
            notFound();
        }
    }

    /**
     *
     * @param {string} slug - the slug of the page to translate
     * @returns {Promise<any>} - A Promise that resolves to the translated paths e.g. {en: 'path', fr: 'path'}
     */
    async getTranslatedPaths(slug) {
        const apiUrl = '/nodehive/api/translated-paths?path=' + slug;
        try {
            return this.request(apiUrl.toString());
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getResourceBySlug(slug, lang = null) {
        try {
            const response = await this.router(slug, lang);

            // Check if the response contains a UUID and bundle
            if (response?.entity?.uuid && response.entity.bundle) {
                const node = await this.getNode(
                    response.entity.uuid,
                    response.entity.bundle,
                    lang,
                );
                return node;
            } else {
                throw new Error("Resource not found");
            }
        } catch (error) {
            console.error(error);
            return null;
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
            userDetails,
        )}; path=/; max-age=31536000; SameSite=None; Secure`;
    }

    /**
     * Clears the current user's token and details from cookies.
     */
    clearUserDetails() {
        document.cookie =
            "userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
            "userDetails=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    /**
     * Retrieves the stored token from cookies.
     *
     * @return {string|null}
     */
    getToken() {
        return this.getCookie("userToken");
    }

    /**
     * Retrieves the stored user details from cookies.
     *
     * @return {object|null}
     */
    getUserDetails() {
        const userDetails = this.getCookie("userDetails");
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
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    }

    /**
     * Get a JWT token using the user's email and password.
     *
     * @param {string} email - The user's email
     * @param {string} password - The user's password
     * @return {Promise} - A Promise that resolves to the JWT token
     */
    async getJWTAccessToken(email, password) {
        let data;
        let error;

        const loginData = Buffer.from(`${email}:${password}`).toString("base64");

        const response = await fetch(this.baseUrl + `/jwt/token?_format=json`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${loginData}`,
            },
        });

        if (!response.ok) {
            error = "getJWTAccessToken response status: " + response.status;
        } else {
            const responseData = await response.json();

            data = responseData?.token;
        }

        return { data, error }
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
            const loginData = Buffer.from(`${email}:${password}`).toString("base64");
            const response = await fetch(this.baseUrl + `/jwt/token?_format=json`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${loginData}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.storeUserDetails(data.token, { email });

                // Fetch additional user details
                const userDetails = await this.fetchUserDetails(data.token);
                this.storeUserDetails(data.token, userDetails); // Store all user details

                return true;
            } else {
                throw new Error("Unknown username or bad password");
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
        const token = this.getCookie("userToken");
        return !!token; // Returns true if token exists, false otherwise
    }

    async fetchUserDetails(token) {
        // Decode JWT and log the data
        const decodedJwt = this.decodeJwt(token);

        const response = await fetch(
            this.baseUrl + `/user/` + decodedJwt.drupal.uid + `?_format=json`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.ok) {
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
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const sessionData = await sessionActive.json();
            return sessionData === 1;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    decodeJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join(""),
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT", e);
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
        const cookies = document.cookie.split("; ");
        const cookieData = {};
        cookies.forEach((cookie) => {
            const [key, value] = cookie.split("=");
            cookieData[key] = value;
        });
        return cookieData;
    }
}
