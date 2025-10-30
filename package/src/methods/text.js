import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Text-related methods for NodeHiveClient
 */

/**
 * Get texts (list)
 */
export async function getTexts(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'texts');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/texts/texts${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get single text
 */
export async function getText(client, uuid, options = {}) {
    if (!uuid) {
        throw new ValidationError('UUID is required', 'uuid', uuid);
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'texts');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/texts/texts/${uuid}${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}
