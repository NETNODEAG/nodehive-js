import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Taxonomy-related methods for NodeHiveClient
 */

/**
 * Get taxonomy vocabularies
 */
export async function getTaxonomyVocabularies(client, options = {}) {
    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;

    client._applyConfigToParams(params, 'taxonomy_vocabulary');
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_vocabulary/taxonomy_vocabulary${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get taxonomy terms (renamed from getTaxonomies for clarity)
 */
export async function getTaxonomyTerms(client, vocabularyId, options = {}) {
    if (!vocabularyId) {
        throw new ValidationError('Vocabulary ID is required', 'vocabularyId', vocabularyId);
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `taxonomy_term--${vocabularyId}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_term/${vocabularyId}${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get single taxonomy term
 */
export async function getTaxonomyTerm(client, termId, vocabularyId, options = {}) {
    if (!termId || !vocabularyId) {
        throw new ValidationError('Term ID and vocabulary ID are required');
    }

    const { lang, params = new DrupalJsonApiParams(), ...requestOptions } = options;
    const entityType = `taxonomy_term--${vocabularyId}`;

    client._applyConfigToParams(params, entityType);
    const queryString = client._buildQueryString(params);
    const endpoint = `/jsonapi/taxonomy_term/${vocabularyId}/${termId}${queryString ? '?' + queryString : ''}`;

    return client.request(endpoint, { lang, ...requestOptions });
}

/**
 * Get taxonomy list (legacy name)
 * @deprecated Use getTaxonomyTerms instead
 */
export async function getTaxonomies(client, taxonomyType, lang = null, params = new DrupalJsonApiParams()) {
    console.warn('Deprecated: Use getTaxonomyTerms() instead of getTaxonomies()');
    return getTaxonomyTerms(client, taxonomyType, { lang, params });
}
