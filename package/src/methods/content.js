import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Content-related methods for NodeHiveClient
 */

/**
 * Get content types
 */
export async function getContentTypes(client, options = {}) {
    return client.request('/jsonapi/node_type/node_type', options);
}

/**
 * Get nodes (list)
 */
export async function getNodes(client, contentType, options = {}) {
    if (!contentType) {
        throw new ValidationError('Content type is required', 'contentType', contentType);
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `node-${contentType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/node/${contentType}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get single node
 */
export async function getNode(client, uuid, contentType, options = {}) {
    if (!uuid || !contentType) {
        throw new ValidationError('UUID and content type are required');
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `node-${contentType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/node/${contentType}/${uuid}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get resource by slug (convenience method)
 *
 * options.params may be a DrupalJsonApiParams/plain object (as before) or a
 * function (bundle) => params. The function form is resolved after the router
 * call, so callers can set includes/fields/filters per resolved bundle without
 * knowing the content type up front.
 */
export async function getResourceBySlug(client, slug, options = {}) {
    const { lang, params, ...requestOptions } = options;

    try {
        const routerResponse = await client.router(slug, { lang, ...requestOptions });

        if (routerResponse?.entity?.uuid && routerResponse.entity.bundle) {
            const { bundle } = routerResponse.entity;
            const resolvedParams = typeof params === 'function' ? params(bundle) : params;

            return client.getNode(routerResponse.entity.uuid, bundle, {
                lang,
                ...requestOptions,
                params: resolvedParams,
            });
        }

        return null;
    } catch (error) {
        if (client.debug) console.error('getResourceBySlug error:', error);
        return null;
    }
}
