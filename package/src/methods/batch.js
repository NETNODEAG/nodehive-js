import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

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

/**
 * Get paginated results
 */
export async function* paginate(client, method, args = [], pageSize = 50) {
    // Handle different argument formats
    let methodArgs = [...args];
    let options = {};

    // Check if last argument is an options object
    if (methodArgs.length > 0 && typeof methodArgs[methodArgs.length - 1] === 'object' &&
        !Array.isArray(methodArgs[methodArgs.length - 1]) &&
        !(methodArgs[methodArgs.length - 1] instanceof DrupalJsonApiParams)) {
        options = methodArgs.pop();
    }

    // Initialize or get params
    const params = options.params || new DrupalJsonApiParams();
    params.addPageLimit(pageSize);

    let page = 0;
    let hasMore = true;

    while (hasMore) {
        params.addPageOffset(page * pageSize);

        // Build final arguments
        const finalArgs = [...methodArgs];
        if (method === 'getNodes' || method === 'getTaxonomyTerms') {
            // These methods expect options object as second param
            finalArgs.push({ ...options, params });
        } else {
            finalArgs.push(params);
        }

        const response = await client[method](...finalArgs);
        yield response.data || response;

        hasMore = response.links?.next !== undefined;
        page++;
    }
}
