import { ApiError, ValidationError } from '../errors.js';

/**
 * Unwrap a NodeHive Public API envelope for semantic helper methods.
 *
 * client.request() intentionally returns the raw response. Public API helpers
 * use this to return domain data directly and to convert 200-level API errors
 * into typed ApiError instances.
 */
export function unwrapPublicApiEnvelope(response) {
    if (!response || typeof response !== 'object' || !('status' in response)) {
        return response;
    }

    if (response.status === 'ok') {
        return response.data;
    }

    if (response.status === 'error') {
        const apiError = response.error ?? 'NodeHive API returned an error';
        const message = typeof apiError === 'string'
            ? apiError
            : apiError.message || apiError.title || 'NodeHive API returned an error';

        throw new ApiError(message, apiError, response);
    }

    return response;
}

/**
 * Get the NodeHive Public API index.
 */
export async function getApiIndex(client, options = {}) {
    const { lang, ...requestOptions } = options;
    const response = await client.request('/nodehive-api/v1', { lang, ...requestOptions });

    return unwrapPublicApiEnvelope(response);
}

/**
 * Get a space from the NodeHive Public API.
 */
export async function getSpace(client, spaceRef, options = {}) {
    if (!spaceRef) {
        throw new ValidationError('Space reference is required', 'spaceRef', spaceRef);
    }

    const { lang, ...requestOptions } = options;
    const response = await client.request(`/nodehive-api/v1/space/${spaceRef}`, { lang, ...requestOptions });

    return unwrapPublicApiEnvelope(response);
}
