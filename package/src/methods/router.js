import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

/**
 * Router and path-related methods for NodeHiveClient
 */

/**
 * Translate path to entity
 */
export async function router(client, slug, options = {}) {
    const { lang, ...requestOptions } = options;
    const endpoint = `/router/translate-path?path=/${slug}`;

    try {
        return await client.request(endpoint, { lang, ...requestOptions });
    } catch (error) {
        if (client.debug) console.error('Router error:', error);
        return null;
    }
}

/**
 * Get route by path
 */
export async function getRouteByPath(client, path, options = {}) {
    const { lang, ...requestOptions } = options;
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const endpoint = `/router/translate-path?path=${encodeURIComponent(cleanPath)}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Translate path (alias to internal or vice versa)
 */
export async function translatePath(client, path, language) {
    const options = language ? { lang: language } : {};
    return getRouteByPath(client, path, options);
}

/**
 * Get all path aliases
 */
export async function getPathAliases(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'path_alias');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/path_alias/path_alias${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get all redirects
 */
export async function getRedirects(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'redirect');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/redirect/redirect${queryString ? '?' + queryString : ''}`;

    try {
        return client.request(endpoint, { lang, ...requestOptions });
    } catch (error) {
        // Redirects might not be available on all Drupal instances
        if (client.debug) console.error('Redirects not available:', error);
        return { data: [], error: 'Redirect module may not be installed' };
    }
}

/**
 * Get redirect information
 */
export async function getRedirect(client, slug, options = {}) {
    const { lang, ...requestOptions } = options;

    try {
        const routerResponse = await router(client, slug, { lang, ...requestOptions });

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
                status: 301
            };
        }

        return null;
    } catch (error) {
        if (client.debug) console.error('getRedirect error:', error);
        return null;
    }
}

/**
 * Get translated paths
 */
export async function getTranslatedPaths(client, slug, options = {}) {
    const endpoint = `/nodehive/api/translated-paths?path=${slug}`;
    return client.request(endpoint, options);
}
