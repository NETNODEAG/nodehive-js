import { DrupalJsonApiParams } from "drupal-jsonapi-params";
import { NetworkError, ValidationError, ConfigurationError } from "./errors.js";
import {
  AuthManager,
  MemoryStorage,
  BrowserStorage,
  CookieStorage,
} from "./auth.js";

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
   * @param {number} options.timeout - Request timeout in milliseconds
   * @param {Object} options.cache - Cache configuration
   * @param {Object} options.retry - Retry configuration
   * @param {Function[]} options.interceptors - Request/response interceptors
   * @param {Object} legacyConfig - Legacy configuration (deprecated)
   * @param {Object} legacyOptions - Legacy options (deprecated)
   */
  constructor(options, legacyConfig = {}, legacyOptions = {}) {
    // Backwards compatibility: handle old constructor signature
    if (typeof options === "string") {
      console.warn(
        'Deprecated: Use new NodeHiveClient({ baseUrl: "..." }) instead of NodeHiveClient("...")'
      );
      options = {
        baseUrl: options,
        config: legacyConfig,
        ...legacyOptions,
      };
    }

    // Validate required options
    if (!options?.baseUrl) {
      throw new ConfigurationError("baseUrl is required");
    }

    // Initialize configuration
    this.baseUrl = options.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.config = options.config || {};
    this.debug = options.debug || false;
    this.defaultLanguage = options.defaultLanguage || null;
    this.timeout = options.timeout || 30000;
    this.cache = options.cache || null;
    this.retry = {
      enabled: options.retry?.enabled ?? true,
      maxAttempts: options.retry?.maxAttempts || 3,
      delay: options.retry?.delay || 1000,
      ...options.retry,
    };

    // Initialize interceptors
    this.interceptors = {
      request: [],
      response: [],
    };
    if (options.interceptors) {
      options.interceptors.forEach((interceptor) => {
        if (interceptor.request)
          this.interceptors.request.push(interceptor.request);
        if (interceptor.response)
          this.interceptors.response.push(interceptor.response);
      });
    }

    // Initialize authentication manager
    const storageAdapter = this._createStorageAdapter(options.auth?.storage);
    const authConfig = {
      method: options.auth?.method,
      oauth: options.auth?.oauth,
      apiKey: options.auth?.apiKey,
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
    this.authenticateClientCredentials =
      this.auth.authenticateClientCredentials.bind(this.auth);
  }

  /**
   * Create storage adapter based on configuration
   */
  _createStorageAdapter(storageConfig) {
    if (!storageConfig) return new MemoryStorage();

    switch (storageConfig.type) {
      case "localStorage":
      case "sessionStorage":
        if (typeof window !== "undefined") {
          return new BrowserStorage(storageConfig.type);
        }
        return new MemoryStorage();
      case "cookie":
        if (typeof document !== "undefined") {
          return new CookieStorage();
        }
        return new MemoryStorage();
      case "custom":
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
      method = "GET",
      data = null,
      headers = {},
      lang = null,
      skipInterceptors = false,
      retryCount = 0,
    } = options;

    // Build URL
    const langPrefix = lang;
    const path = langPrefix ? `/${langPrefix}${endpoint}` : endpoint;
    const url = `${this.baseUrl}${path}`;

    // Prepare request config
    let requestConfig = {
      method,
      headers: {
        "Content-Type": "application/vnd.api+json",
        ...headers,
      },
      redirect: "follow",
    };

    // Add timeout support
    if (this.timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      requestConfig.signal = controller.signal;
      requestConfig.timeoutId = timeoutId;
    }

    // Add authentication
    const token = await this.auth.getToken();
    if (token) {
      requestConfig.headers["Authorization"] = `Bearer ${token}`;
    } else if (this.auth.isClientCredentialsGrant()) {
      await this.authenticateClientCredentials();
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
      console.log("--- NodeHive Request Debug ---");
      console.log("URL:", url);
      const debugConfig = { ...requestConfig };
      delete debugConfig.signal;
      delete debugConfig.timeoutId;
      console.log("Config:", JSON.stringify(debugConfig, null, 2));
      console.log("--- End Debug ---");
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
        if (
          response.status === 401 &&
          this.auth.authMethod === "oauth" &&
          retryCount === 0
        ) {
          try {
            // Attempt to refresh the token
            if (this.auth.isClientCredentialsGrant()) {
              await this.authenticateClientCredentials();
            } else {
              await this.auth.refreshToken();
            }
            // Retry the request with the new token
            return this.request(endpoint, {
              ...options,
              retryCount: retryCount + 1,
            });
          } catch (refreshError) {
            // If refresh fails, throw the original 401 error
            if (this.debug) {
              console.log("Token refresh failed:", refreshError.message);
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
          const shouldRetry = [408, 429, 500, 502, 503, 504].includes(
            response.status
          );
          if (shouldRetry) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.retry.delay * (retryCount + 1))
            );
            return this.request(endpoint, {
              ...options,
              retryCount: retryCount + 1,
            });
          }
        }

        throw error;
      }

      let responseData = await response.json();

      // Apply response interceptors
      if (!skipInterceptors) {
        for (const interceptor of this.interceptors.response) {
          responseData = await interceptor(responseData, {
            response,
            url,
            client: this,
          });
        }
      }

      return responseData;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new NetworkError("Request timeout", 408, null, url);
      }
      if (error instanceof NetworkError) {
        throw error;
      }
      throw new NetworkError(
        `Network request failed: ${error.message}`,
        0,
        null,
        url
      );
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
      typeConfig.addFilter.forEach((filter) => params.addFilter(filter));
    }

    if (typeConfig.addFields) {
      typeConfig.addFields.forEach((field) =>
        params.addFields(entityType, [field])
      );
    }

    if (typeConfig.addInclude) {
      typeConfig.addInclude.forEach((include) => params.addInclude([include]));
    }
  }

  /**
   * Build query string from params
   */
  _buildQueryString(params) {
    if (!params) return "";

    // Handle string - show helpful error
    if (typeof params === "string") {
      throw new ValidationError(
        "params should be a DrupalJsonApiParams object or plain object, not a string. " +
          "Remove .getQueryString() and pass the params object directly.",
        "params",
        params
      );
    }

    // Handle DrupalJsonApiParams object or any object with getQueryString method
    if (typeof params.getQueryString === "function") {
      return params.getQueryString({ encode: false });
    }

    // Handle plain object (convert to URLSearchParams)
    if (typeof params === "object" && params !== null) {
      return new URLSearchParams(params).toString();
    }

    throw new ValidationError(
      "params must be a DrupalJsonApiParams object or a plain object",
      "params",
      params
    );
  }

  // ===== Content Methods =====

  /**
   * Get content types
   */
  async getContentTypes(options = {}) {
    return this.request("/jsonapi/node_type/node_type", options);
  }

  /**
   * Get nodes (list)
   */
  async getNodes(contentType, options = {}) {
    if (!contentType) {
      throw new ValidationError(
        "Content type is required",
        "contentType",
        contentType
      );
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `node-${contentType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/node/${contentType}${
      queryString ? "?" + queryString : ""
    }${queryString ? "&" : "?"}jsonapi_include=1`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get single node
   */
  async getNode(uuid, contentType, options = {}) {
    if (!uuid || !contentType) {
      throw new ValidationError("UUID and content type are required");
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `node-${contentType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/node/${contentType}/${uuid}${
      queryString ? "?" + queryString : ""
    }${queryString ? "&" : "?"}jsonapi_include=1`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get resource by slug (convenience method)
   */
  async getResourceBySlug(slug, options = {}) {
    const { lang, ...requestOptions } = options;

    try {
      const routerResponse = await this.router(slug, {
        lang,
        ...requestOptions,
      });

      if (routerResponse?.entity?.uuid && routerResponse.entity.bundle) {
        return this.getNode(
          routerResponse.entity.uuid,
          routerResponse.entity.bundle,
          options
        );
      }

      return null;
    } catch (error) {
      if (this.debug) console.error("getResourceBySlug error:", error);
      return null;
    }
  }

  // ===== Menu Methods =====

  /**
   * Get available menus (legacy method name)
   */
  async getAvailableMenus(options = {}) {
    return this.getMenus(options);
  }

  /**
   * Get all menus
   */
  async getMenus(options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "menu");
    const queryString = this._buildQueryString(params);
    const includeParam = queryString
      ? "&jsonapi_include=1"
      : "?jsonapi_include=1";
    const endpoint = `/jsonapi/menu/menu${
      queryString ? "?" + queryString : ""
    }${includeParam}`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get menu items (legacy method name)
   */
  async getMenuItems(menuId, options = {}) {
    return this.getMenuLinks(menuId, options);
  }

  /**
   * Get menu links
   */
  async getMenuLinks(menuId, options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    // Add menu filter if not already present
    if (menuId && !params.getQueryString().includes("menu_name")) {
      params.addFilter("menu_name", menuId);
    }

    this._applyConfigToParams(params, "menu_link_content");
    const queryString = this._buildQueryString(params);
    const includeParam = queryString
      ? "&jsonapi_include=1"
      : "?jsonapi_include=1";
    const endpoint = `/jsonapi/menu_link_content/menu_link_content${
      queryString ? "?" + queryString : ""
    }${includeParam}`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get menu tree (hierarchical structure)
   */
  async getMenuTree(menuId, options = {}) {
    const { lang, ...requestOptions } = options;

    // This endpoint might vary based on Drupal configuration
    // Fallback to menu links if tree endpoint doesn't exist
    try {
      const endpoint = `/jsonapi/menu_items/${menuId}?jsonapi_include=1`;
      return await this.request(endpoint, { lang, ...requestOptions });
    } catch (error) {
      // Fallback to regular menu links
      return this.getMenuLinks(menuId, options);
    }
  }

  // ===== Taxonomy Methods =====

  /**
   * Get taxonomy vocabularies
   */
  async getTaxonomyVocabularies(options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "taxonomy_vocabulary");
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_vocabulary/taxonomy_vocabulary${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get taxonomy terms (renamed from getTaxonomies for clarity)
   */
  async getTaxonomyTerms(vocabularyId, options = {}) {
    if (!vocabularyId) {
      throw new ValidationError(
        "Vocabulary ID is required",
        "vocabularyId",
        vocabularyId
      );
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `taxonomy_term--${vocabularyId}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_term/${vocabularyId}${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get single taxonomy term
   */
  async getTaxonomyTerm(termId, vocabularyId, options = {}) {
    if (!termId || !vocabularyId) {
      throw new ValidationError("Term ID and vocabulary ID are required");
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `taxonomy_term--${vocabularyId}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_term/${vocabularyId}/${termId}${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  // ===== Media Methods =====

  /**
   * Get single media item
   */
  async getMedia(uuid, mediaType, options = {}) {
    if (!uuid || !mediaType) {
      throw new ValidationError("UUID and media type are required");
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `media-${mediaType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/media/${mediaType}/${uuid}${
      queryString ? "?" + queryString : ""
    }${queryString ? "&" : "?"}jsonapi_include=1`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get media list (renamed from getMedias)
   */
  async getMediaList(mediaType, options = {}) {
    if (!mediaType) {
      throw new ValidationError(
        "Media type is required",
        "mediaType",
        mediaType
      );
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `media--${mediaType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const includeParam = queryString
      ? "&jsonapi_include=1"
      : "?jsonapi_include=1";
    const endpoint = `/jsonapi/media/${mediaType}${
      queryString ? "?" + queryString : ""
    }${includeParam}`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Alias for backwards compatibility
   * @deprecated Use getMediaList instead
   */
  async getMedias(mediaType, lang = null, params = new DrupalJsonApiParams()) {
    console.warn("Deprecated: Use getMediaList() instead of getMedias()");
    return this.getMediaList(mediaType, { lang, params });
  }

  // ===== Text Methods =====

  /**
   * Get texts (list)
   */
  async getTexts(options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "texts");
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/texts/texts${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get single text
   */
  async getText(uuid, options = {}) {
    if (!uuid) {
      throw new ValidationError("UUID is required", "uuid", uuid);
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "texts");
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/texts/texts/${uuid}${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  // ===== Fragment Methods =====

  /**
   * Get fragment
   */
  async getFragment(uuid, fragmentType, options = {}) {
    if (!uuid || !fragmentType) {
      throw new ValidationError("UUID and fragment type are required");
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `nodehive_fragment--${fragmentType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/nodehive_fragment/${fragmentType}/${uuid}${
      queryString ? "?" + queryString : ""
    }${queryString ? "&" : "?"}jsonapi_include=1`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get area with fragments
   */
  async getArea(uuid, options = {}) {
    if (!uuid) {
      throw new ValidationError("UUID is required", "uuid", uuid);
    }

    const { lang, ...requestOptions } = options;
    const endpoint = `/jsonapi/nodehive_area/nodehive_area/${uuid}?jsonapi_include=1&include=fragment_id`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  // ===== Paragraph Methods =====

  /**
   * Get paragraph
   */
  async getParagraph(uuid, paragraphType, options = {}) {
    if (!uuid || !paragraphType) {
      throw new ValidationError("UUID and paragraph type are required");
    }

    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;
    const entityType = `paragraph-${paragraphType}`;

    this._applyConfigToParams(params, entityType);
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/paragraph/${paragraphType}/${uuid}${
      queryString ? "?" + queryString : ""
    }${queryString ? "&" : "?"}jsonapi_include=1`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  // ===== Router Methods =====

  /**
   * Translate path to entity
   */
  async router(slug, options = {}) {
    const { lang, ...requestOptions } = options;
    const endpoint = `/router/translate-path?path=/${slug}`;

    try {
      return await this.request(endpoint, { lang, ...requestOptions });
    } catch (error) {
      if (this.debug) console.error("Router error:", error);
      return null;
    }
  }

  /**
   * Get route by path
   */
  async getRouteByPath(path, options = {}) {
    const { lang, ...requestOptions } = options;
    // Ensure path starts with /
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const endpoint = `/router/translate-path?path=${encodeURIComponent(
      cleanPath
    )}`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Translate path (alias to internal or vice versa)
   */
  async translatePath(path, language) {
    const options = language ? { lang: language } : {};
    return this.getRouteByPath(path, options);
  }

  /**
   * Get all path aliases
   */
  async getPathAliases(options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "path_alias");
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/path_alias/path_alias${
      queryString ? "?" + queryString : ""
    }`;

    return this.request(endpoint, { lang, ...requestOptions });
  }

  /**
   * Get all redirects
   */
  async getRedirects(options = {}) {
    const {
      lang,
      params = new DrupalJsonApiParams(),
      ...requestOptions
    } = options;

    this._applyConfigToParams(params, "redirect");
    const queryString = this._buildQueryString(params);
    const endpoint = `/jsonapi/redirect/redirect${
      queryString ? "?" + queryString : ""
    }`;

    try {
      return this.request(endpoint, { lang, ...requestOptions });
    } catch (error) {
      // Redirects might not be available on all Drupal instances
      if (this.debug) console.error("Redirects not available:", error);
      return { data: [], error: "Redirect module may not be installed" };
    }
  }

  /**
   * Get redirect information
   */
  async getRedirect(slug, options = {}) {
    const { lang, ...requestOptions } = options;

    try {
      const routerResponse = await this.router(slug, {
        lang,
        ...requestOptions,
      });

      if (routerResponse?.redirect?.[0]) {
        const { from, to, status } = routerResponse.redirect[0];
        return { from, to, status: Number(status) };
      }

      const currentPath = lang ? `/${lang}/${slug}` : `/${slug}`;
      const routerEntityPath = routerResponse?.entity?.path;

      if (routerEntityPath && routerEntityPath !== currentPath) {
        return {
          from: currentPath,
          to: routerEntityPath,
          status: 301,
        };
      }

      return null;
    } catch (error) {
      if (this.debug) console.error("getRedirect error:", error);
      return null;
    }
  }

  /**
   * Get translated paths
   */
  async getTranslatedPaths(slug, options = {}) {
    const endpoint = `/nodehive/api/translated-paths?path=${slug}`;
    return this.request(endpoint, options);
  }

  // ===== Batch Operations =====

  /**
   * Fetch multiple resources in parallel
   */
  async batch(requests) {
    return Promise.all(
      requests.map((req) => {
        const { method, args = [] } = req;
        return this[method](...args).catch((error) => ({
          error,
          request: req,
        }));
      })
    );
  }

  // ===== Pagination Helpers =====

  /**
   * Get paginated results
   */
  async *paginate(method, args = [], pageSize = 50) {
    // Handle different argument formats
    let methodArgs = [...args];
    let options = {};

    // Check if last argument is an options object
    if (
      methodArgs.length > 0 &&
      typeof methodArgs[methodArgs.length - 1] === "object" &&
      !Array.isArray(methodArgs[methodArgs.length - 1]) &&
      !(methodArgs[methodArgs.length - 1] instanceof DrupalJsonApiParams)
    ) {
      options = methodArgs.pop();
    }

    // Initialize or get params
    const params = options.params || new DrupalJsonApiParams();
    params.addPageLimit(pageSize);

    let page = 0;
    let hasMore = true;

    while (hasMore) {
      params.addPageOffset(page * pageSize);

      // Build final arguments
      const finalArgs = [...methodArgs];
      if (method === "getNodes" || method === "getTaxonomyTerms") {
        // These methods expect options object as second param
        finalArgs.push({ ...options, params });
      } else {
        finalArgs.push(params);
      }

      const response = await this[method](...finalArgs);
      yield response.data || response;

      hasMore = response.links?.next !== undefined;
      page++;
    }
  }

  // ===== Backwards Compatibility Methods =====

  /**
   * Get taxonomy list (legacy name)
   * @deprecated Use getTaxonomyTerms instead
   */
  async getTaxonomies(
    taxonomyType,
    lang = null,
    params = new DrupalJsonApiParams()
  ) {
    console.warn(
      "Deprecated: Use getTaxonomyTerms() instead of getTaxonomies()"
    );
    return this.getTaxonomyTerms(taxonomyType, { lang, params });
  }

  /**
   * Get JWT access token
   * @deprecated Use auth.login() instead
   */
  async getJWTAccessToken(email, password) {
    console.warn("Deprecated: Use auth.login() instead of getJWTAccessToken()");
    try {
      const result = await this.auth.login(email, password);
      return { data: result.token, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Legacy cookie methods for backwards compatibility
  storeUserDetails() {
    console.warn("Deprecated: User details are now handled automatically");
  }

  clearUserDetails() {
    console.warn("Deprecated: Use logout() instead");
    this.logout();
  }

  getCookie(name) {
    console.warn("Deprecated: Cookie access is now handled internally");
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(";").shift() : null;
  }

  getAllCookieData() {
    console.warn("Deprecated: Cookie access is now handled internally");
    if (typeof document === "undefined") return {};
    const cookies = document.cookie.split("; ");
    const cookieData = {};
    cookies.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      cookieData[key] = value;
    });
    return cookieData;
  }

  hasRole() {
    console.warn("Deprecated: Implement role checking in your application");
    return false;
  }

  decodeJwt(token) {
    console.warn("Deprecated: JWT decoding is now handled internally");
    return this.auth.decodeJwt(token);
  }

  fetchUserDetails(token) {
    console.warn("Deprecated: User details fetching is now handled internally");
    return this.auth.fetchUserDetails(token);
  }
}
