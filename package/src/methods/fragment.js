import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Fragment-related methods for NodeHiveClient
 */

/**
 * Get single fragment
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
 * Get fragments (list)
 */
export async function getFragments(client, fragmentType, options = {}) {
    if (!fragmentType) {
        throw new ValidationError('Fragment type is required', 'fragmentType', fragmentType);
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `nodehive_fragment--${fragmentType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/nodehive_fragment/${fragmentType}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}
