import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Paragraph-related methods for NodeHiveClient
 */

/**
 * Get paragraph
 */
export async function getParagraph(client, uuid, paragraphType, options = {}) {
    if (!uuid || !paragraphType) {
        throw new ValidationError('UUID and paragraph type are required');
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `paragraph-${paragraphType}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/paragraph/${paragraphType}/${uuid}${queryString ? '?' + queryString : ''}${queryString ? '&' : '?'}jsonapi_include=1`;

    return client.request(endpoint, { lang, ...requestOptions });
}
