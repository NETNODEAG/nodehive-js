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
 */
export async function getResourceBySlug(client, slug, options = {}) {
    const { lang, ...requestOptions } = options;

    try {
        const routerResponse = await client.router(slug, { lang, ...requestOptions });

        if (routerResponse?.entity?.uuid && routerResponse.entity.bundle) {
            return client.getNode(
                routerResponse.entity.uuid,
                routerResponse.entity.bundle,
                options
            );
        }

        return null;
    } catch (error) {
        if (client.debug) console.error('getResourceBySlug error:', error);
        return null;
    }
}
