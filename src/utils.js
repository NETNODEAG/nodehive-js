import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

/**
 * Builds the query string for the API call using DrupalJsonApiParams.
 * @param {DrupalJsonApiParams} params - The instance of DrupalJsonApiParams.
 * @returns {string} - The constructed query string.
 */
export function buildQueryString(params) {
    if (!(params instanceof DrupalJsonApiParams)) {
        throw new Error("The 'params' must be an instance of DrupalJsonApiParams.");
    }
    return params.getQueryString({ encode: false });
}
