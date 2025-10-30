import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Fragment-related methods for NodeHiveClient
 */

/**
 * Get fragment
 */
export async function getFragment(client, uuid, fragmentType, options = {}) {
    if (!uuid || !fragmentType) {
        throw new ValidationError('UUID and fragment type are required');
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `nodehive_fragment--${fragmentType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/nodehive_fragment/${fragmentType}/${uuid}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get area with fragments
 */
export async function getArea(client, uuid, options = {}) {
    if (!uuid) {
        throw new ValidationError('UUID is required', 'uuid', uuid);
    }

    const { lang, ...requestOptions } = options;
    const endpoint = `/jsonapi/nodehive_area/nodehive_area/${uuid}?jsonapi_include=1&include=fragment_id`;

    return client.request(endpoint, { lang, ...requestOptions });
}
