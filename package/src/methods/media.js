import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Media-related methods for NodeHiveClient
 */

/**
 * Get single media item
 */
export async function getMedia(client, uuid, mediaType, options = {}) {
    if (!uuid || !mediaType) {
        throw new ValidationError('UUID and media type are required');
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `media-${mediaType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/media/${mediaType}/${uuid}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get media list (renamed from getMedias)
 */
export async function getMediaList(client, mediaType, options = {}) {
    if (!mediaType) {
        throw new ValidationError('Media type is required', 'mediaType', mediaType);
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `media--${mediaType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const includeParam = queryString ? '&jsonapi_include=1' : '?jsonapi_include=1';
    const endpoint = `/jsonapi/media/${mediaType}${queryString ? '?' + queryString : ''}${includeParam}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Alias for backwards compatibility
 * @deprecated Use getMediaList instead
 */
export async function getMedias(client, mediaType, lang = null, params = new DrupalJsonApiParams()) {
    console.warn('Deprecated: Use getMediaList() instead of getMedias()');
    return getMediaList(client, mediaType, { lang, params });
}
