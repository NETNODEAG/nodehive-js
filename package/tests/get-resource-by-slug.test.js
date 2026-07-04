#!/usr/bin/env node

/**
 * Unit tests for getResourceBySlug params resolution.
 * Backend-free: the client is mocked, only the resolver branch is exercised.
 */

import assert from 'node:assert';
import { getResourceBySlug } from '../src/methods/content.js';

function makeClient() {
    const calls = { router: [], getNode: [] };
    const client = {
        debug: false,
        async router(slug, options) {
            calls.router.push({ slug, options });
            return { entity: { uuid: 'uuid-1', bundle: 'page' } };
        },
        async getNode(uuid, bundle, options) {
            calls.getNode.push({ uuid, bundle, options });
            return { data: { id: uuid, bundle } };
        },
    };
    return { client, calls };
}

async function run() {
    {
        const { client, calls } = makeClient();
        let receivedBundle = null;
        const marker = { marker: 'resolved' };
        await getResourceBySlug(client, 'some/slug', {
            lang: 'en',
            params: (bundle) => {
                receivedBundle = bundle;
                return marker;
            },
        });
        assert.strictEqual(receivedBundle, 'page', 'resolver called with resolved bundle');
        assert.strictEqual(calls.getNode[0].options.params, marker, 'resolved params forwarded to getNode');
        assert.strictEqual(calls.getNode[0].bundle, 'page');
    }

    {
        const { client, calls } = makeClient();
        const params = { some: 'object' };
        await getResourceBySlug(client, 'some/slug', { lang: 'en', params });
        assert.strictEqual(calls.getNode[0].options.params, params, 'object params forwarded unchanged');
    }

    {
        const { client, calls } = makeClient();
        await getResourceBySlug(client, 'some/slug', { lang: 'en', params: () => ({}) });
        assert.ok(!('params' in calls.router[0].options), 'router options carry no params');
    }

    {
        const { client } = makeClient();
        client.router = async () => ({});
        const result = await getResourceBySlug(client, 'x', {});
        assert.strictEqual(result, null, 'returns null when router resolves no entity');
    }

    console.log('getResourceBySlug resolver: all assertions passed');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
