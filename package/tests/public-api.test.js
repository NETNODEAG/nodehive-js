/**
 * NodeHive Public API helper tests
 */

import { ApiError, NetworkError, NodeHiveClient } from '../index.js';
import { TestHelper } from './test-helper.js';

function createClient() {
    return new NodeHiveClient({
        baseUrl: 'https://example.test',
        retry: { enabled: false },
    });
}

function mockFetch(response) {
    globalThis.fetch = async () => response;
}

function jsonResponse(body, init = {}) {
    return {
        ok: init.status ? init.status >= 200 && init.status < 300 : true,
        status: init.status ?? 200,
        statusText: init.statusText ?? 'OK',
        json: async () => body,
    };
}

export async function runTests() {
    const helper = new TestHelper('NodeHive Public API Helpers');
    const originalFetch = globalThis.fetch;

    helper.section('Raw request behavior');

    await helper.test('client.request() returns raw API envelope', async () => {
        mockFetch(jsonResponse({ status: 'ok', data: { value: 42 } }));

        const response = await createClient().request('/nodehive-api/v1');

        helper.assert(response.status === 'ok', 'raw status should be preserved');
        helper.assert(response.data.value === 42, 'raw data should be preserved');
    });

    await helper.test('client.request() returns null for empty-body statuses (204/205)', async () => {
        for (const status of [204, 205]) {
            mockFetch({
                ok: true,
                status,
                statusText: 'No Content',
                json: async () => {
                    throw new Error('Unexpected end of JSON input');
                },
            });

            const response = await createClient().request('/jsonapi/node/page/123', {
                method: 'DELETE',
            });

            helper.assert(response === null, `${status} response should resolve to null`);
        }
    });

    helper.section('Helper unwrapping');

    await helper.test('getApiIndex() unwraps a successful envelope', async () => {
        mockFetch(jsonResponse({
            status: 'ok',
            data: {
                endpoints: {
                    space: { method: 'GET', path: '/nodehive-api/v1/space/{space_ref}' },
                },
            },
        }));

        const index = await createClient().getApiIndex();

        helper.assert(index.endpoints.space.method === 'GET', 'index data should be returned directly');
    });

    await helper.test('getSpace() unwraps a successful envelope', async () => {
        mockFetch(jsonResponse({
            status: 'ok',
            data: {
                id: 'starter',
                frontpage_node: { id: '123' },
            },
        }));

        const space = await createClient().getSpace('starter', { lang: 'de' });

        helper.assert(space.id === 'starter', 'space data should be returned directly');
        helper.assert(space.frontpage_node.id === '123', 'nested space data should be preserved');
    });

    await helper.test('getMenu() unwraps envelope and exposes items', async () => {
        mockFetch(jsonResponse({
            status: 'ok',
            data: {
                menu_id: 'main',
                language: 'de',
                data: [
                    { title: 'Home', url: '/', description: null, enabled: true, expanded: false, weight: '0' },
                ],
            },
        }));

        const menu = await createClient().getMenu('main', { lang: 'de' });

        helper.assert(menu.menu_id === 'main', 'menu data should be returned directly');
        helper.assert(Array.isArray(menu.items), 'menu items should be exposed as items');
        helper.assert(menu.items[0].title === 'Home', 'menu item data should be preserved');
    });

    await helper.test('getMenuItems() calls the resolved JSON:API menu_items endpoint', async () => {
        let requestedUrl = null;
        globalThis.fetch = async (url) => {
            requestedUrl = url;
            return jsonResponse({
                jsonapi: { version: '1.0' },
                data: [
                    {
                        id: 'menu_link_content:parent',
                        title: 'Parent',
                        url: '/de/parent',
                        parent: '',
                    },
                    {
                        id: 'menu_link_content:child',
                        title: 'Child',
                        url: '/de/child',
                        parent: 'menu_link_content:parent',
                    },
                ],
            });
        };

        const response = await createClient().getMenuItems('main', { lang: 'de' });

        helper.assert(
            requestedUrl === 'https://example.test/de/jsonapi/menu_items/main?jsonapi_include=1',
            `unexpected URL: ${requestedUrl}`
        );
        helper.assert(response.data[1].parent === 'menu_link_content:parent', 'parent relationship should be preserved');
    });

    await helper.test('getMenuTree() remains a deprecated alias for getMenuItems()', async () => {
        let requestedUrl = null;
        globalThis.fetch = async (url) => {
            requestedUrl = url;
            return jsonResponse({ jsonapi: { version: '1.0' }, data: [] });
        };

        await createClient().getMenuTree('main', { lang: 'de' });

        helper.assert(
            requestedUrl === 'https://example.test/de/jsonapi/menu_items/main?jsonapi_include=1',
            `unexpected URL: ${requestedUrl}`
        );
    });

    helper.section('Error handling');

    await helper.test('Public API helpers throw ApiError for 200 status error envelopes', async () => {
        mockFetch(jsonResponse({
            status: 'error',
            error: { message: 'Space not found', code: 'not_found' },
        }));

        try {
            await createClient().getSpace('missing');
        } catch (error) {
            helper.assert(error instanceof ApiError, 'error should be ApiError');
            helper.assert(error.message === 'Space not found', 'ApiError should use API error message');
            helper.assert(error.error.code === 'not_found', 'ApiError should expose API error details');
            return;
        }

        throw new Error('Expected getSpace() to throw ApiError');
    });

    await helper.test('HTTP non-2xx still throws NetworkError', async () => {
        mockFetch(jsonResponse({ status: 'error', error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' }));

        try {
            await createClient().getApiIndex();
        } catch (error) {
            helper.assert(error instanceof NetworkError, 'error should be NetworkError');
            helper.assert(error.status === 403, 'NetworkError should preserve HTTP status');
            return;
        }

        throw new Error('Expected getApiIndex() to throw NetworkError');
    });

    globalThis.fetch = originalFetch;
    return helper.summary();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().then(code => process.exit(code));
}
