import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Area-related methods for NodeHiveClient
 */

/**
 * Get single area with fragments
 */
export async function getArea(client, uuid, options = {}) {
    if (!uuid) {
        throw new ValidationError('UUID is required', 'uuid', uuid);
    }

    const { lang, ...requestOptions } = options;
    const endpoint = `/jsonapi/nodehive_area/nodehive_area/${uuid}?jsonapi_include=1&include=fragment_id`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get areas (list)
 */
export async function getAreas(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'nodehive_area');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/nodehive_area/nodehive_area${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1&include=fragment_id`;

    return client.request(endpoint, { lang, ...requestOptions });
}
