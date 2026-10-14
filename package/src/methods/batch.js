import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { ValidationError } from '../errors.js';

/**
 * Batch and pagination methods for NodeHiveClient
 */

/**
 * Fetch multiple resources in parallel
 */
export async function batch(client, requests) {
    return Promise.all(
        requests.map(req => {
            const { method, args = [] } = req;
            return client[method](...args).catch(error => ({ error, request: req }));
        })
    );
}

const optionsMethods = new Map([
    ['getNodes', 1], ['getNode', 2], ['getResourceBySlug', 1],
    ['getMediaList', 1], ['getMedia', 2],
    ['getTaxonomyVocabularies', 0], ['getTaxonomyTerms', 1], ['getTaxonomyTerm', 2],
    ['getTexts', 0], ['getText', 1], ['getFragments', 1], ['getFragment', 2],
    ['getMenus', 0], ['getAvailableMenus', 0], ['getMenuLinkEntities', 1], ['getMenuLinks', 1],
    ['getAreas', 0], ['getParagraph', 2], ['getPathAliases', 0], ['getRedirects', 0]
]);

const legacyMethods = new Set(['getMedias', 'getTaxonomies']);

function isParams(value) {
    return value !== null && typeof value === 'object' &&
        typeof value.getQueryString === 'function';
}

/**
 * Get paginated results
 */
export async function* paginate(client, method, args = [], pageSize = 50) {
    if (typeof client[method] !== 'function') {
        throw new ValidationError('Unknown pagination method', 'method', method);
    }
    if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new ValidationError('Page size must be a positive integer', 'pageSize', pageSize);
    }

    const methodArgs = [...args];
    const last = methodArgs[methodArgs.length - 1];
    let options = {};
    let suppliedParams;

    if (isParams(last)) {
        suppliedParams = methodArgs.pop();
    } else if (last !== null && typeof last === 'object' && !Array.isArray(last)) {
        options = methodArgs.pop();
        suppliedParams = options.params;
    }

    const params = suppliedParams ?? new DrupalJsonApiParams();
    if (!isParams(params) || typeof params.addPageLimit !== 'function' ||
        typeof params.addPageOffset !== 'function') {
        throw new ValidationError(
            'Pagination params must provide getQueryString(), addPageLimit() and addPageOffset()',
            'params',
            params
        );
    }
    params.addPageLimit(pageSize);

    if (optionsMethods.has(method)) {
        methodArgs[optionsMethods.get(method)] = { ...options, params };
    } else {
        // Unknown/custom methods retain the existing positional params convention.
        if (legacyMethods.has(method) && methodArgs.length === 1) {
            methodArgs.push(options.lang ?? null);
        }
        methodArgs.push(params);
    }

    let page = 0;
    let hasMore = true;
    while (hasMore) {
        params.addPageOffset(page * pageSize);
        const response = await client[method](...methodArgs);
        yield response.data || response;
        hasMore = Boolean(response.links?.next);
        page++;
    }
}
