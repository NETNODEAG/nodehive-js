import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createParamsFixture } from './params-fixture.js';

const fixture = createParamsFixture();
after(() => fixture.dispose());

const modernMethods = [
    ['getNodes', ['page'], 'node-page'],
    ['getTaxonomyTerms', ['tags'], 'taxonomy_term--tags'],
    ['getTaxonomyVocabularies', [], 'taxonomy_vocabulary'],
    ['getMediaList', ['image'], 'media--image'],
    ['getFragments', ['hero'], 'nodehive_fragment--hero'],
    ['getTexts', [], 'texts'],
    ['getAreas', [], 'nodehive_area'],
    ['getMenus', [], 'menu'],
    ['getAvailableMenus', [], 'menu'],
    ['getMenuLinkEntities', ['main'], 'menu_link_content'],
    ['getMenuLinks', ['main'], 'menu_link_content'],
    ['getPathAliases', [], 'path_alias'],
    ['getRedirects', [], 'redirect'],
];
const legacyMethods = [
    ['getMedias', ['image'], 'media--image'],
    ['getTaxonomies', ['tags'], 'taxonomy_term--tags'],
];

function mockPages(t, { filtered = true, lang = 'de', headers = false } = {}) {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (input, options) => {
        const url = new URL(input);
        requests.push(url);
        assert.ok(requests.length <= 2, 'Pagination must terminate after the second page');
        assert.ok(url.pathname.startsWith('/' + lang + '/jsonapi/'), url.href);
        assert.equal(url.searchParams.get('page[limit]'), '2');
        assert.equal(url.searchParams.get('page[offset]'), requests.length === 1 ? '0' : '2');
        if (filtered) {
            assert.equal(url.searchParams.get('filter[status]'), '1');
            assert.equal(url.searchParams.get('sort'), '-created');
            assert.ok(url.searchParams.get('include').split(',').includes('field_image'));
            assert.equal(url.searchParams.get('fields[node--page]'), 'title');
        }
        if (headers) assert.equal(options.headers['X-Fixture'], 'forwarded');
        const offset = Number(url.searchParams.get('page[offset]'));
        return new Response(JSON.stringify({
            data: [{ id: 'item-' + offset }, { id: 'item-' + (offset + 1) }],
            links: { next: offset === 0 ? '/next?page[offset]=2' : null },
        }), { headers: { 'Content-Type': 'application/json' } });
    });
    t.mock.method(console, 'warn', () => {});
    return requests;
}

function makeParams(Params) {
    return new Params()
        .addFilter('status', '1')
        .addInclude(['field_image'])
        .addFields('node--page', ['title'])
        .addSort('created', 'DESC')
        .addPageOffset(999);
}

async function collect(generator) {
    const pages = [];
    for await (const page of generator) pages.push(page);
    return pages;
}

for (const sdkVersion of ['v2', 'v3']) {
    const Client = await fixture.loadClient(sdkVersion);
    for (const [consumerVersion, Params] of Object.entries(fixture.constructors)) {
        for (const [method, requiredArgs, entityType] of modernMethods) {
            test(sdkVersion + '/' + consumerVersion + ' ' + method + ' options retain two pages and query constraints', async t => {
                const requests = mockPages(t, { headers: true });
                const params = makeParams(Params);
                const options = { params, lang: 'de', headers: { 'X-Fixture': 'forwarded' } };
                const args = [...requiredArgs, options];
                const client = new Client({
                    baseUrl: 'https://example.test',
                    defaultLanguage: 'en',
                    retry: { enabled: false },
                    config: { entities: { [entityType]: { addInclude: ['uid'], addFields: ['label'] } } },
                });
                const pages = await collect(client.paginate(method, args, 2));
                assert.deepEqual(pages.flat().map(item => item.id), ['item-0', 'item-1', 'item-2', 'item-3']);
                assert.equal(requests.length, 2);
                for (const url of requests) {
                    assert.ok(url.searchParams.get('include').split(',').includes('uid'));
                    assert.equal(url.searchParams.get('fields[' + entityType + ']'), 'label');
                    if (method === 'getMenuLinkEntities' || method === 'getMenuLinks') {
                        assert.equal(url.searchParams.get('filter[menu_name]'), 'main');
                    }
                }
                assert.equal(args.at(-1), options);
                assert.equal(options.params, params);
                assert.equal(params.getQueryObject().page.offset, 2);
            });
        }

        for (const [method, requiredArgs] of legacyMethods) {
            for (const language of ['de', null, undefined, 'omitted']) {
                test(sdkVersion + '/' + consumerVersion + ' ' + method + ' positional params, language ' + language, async t => {
                    const lang = language === 'de' ? 'de' : 'en';
                    const requests = mockPages(t, { lang });
                    const params = makeParams(Params);
                    const args = language === 'omitted'
                        ? [...requiredArgs, params]
                        : [...requiredArgs, language, params];
                    const client = new Client({
                        baseUrl: 'https://example.test',
                        defaultLanguage: 'en',
                        retry: { enabled: false },
                    });
                    const pages = await collect(client.paginate(method, args, 2));
                    assert.deepEqual(pages.flat().map(item => item.id), ['item-0', 'item-1', 'item-2', 'item-3']);
                    assert.equal(requests.length, 2);
                    assert.equal(args.at(-1), params);
                    assert.equal(params.getQueryObject().page.offset, 2);
                });
            }
        }
    }

    for (const [method, requiredArgs] of [...modernMethods, ...legacyMethods]) {
        test(sdkVersion + ' ' + method + ' creates a builder when none is supplied', async t => {
            mockPages(t, { filtered: false, lang: 'en' });
            const client = new Client({
                baseUrl: 'https://example.test',
                defaultLanguage: 'en',
                retry: { enabled: false },
            });
            const pages = await collect(client.paginate(method, requiredArgs, 2));
            assert.equal(pages.length, 2);
        });
    }

    for (const [method, requiredArgs] of modernMethods) {
        for (const placeholder of [undefined, null]) {
            test(sdkVersion + ' ' + method + ' replaces an explicit empty options slot', async t => {
                mockPages(t, { filtered: false, lang: 'en' });
                const client = new Client({
                    baseUrl: 'https://example.test',
                    defaultLanguage: 'en',
                    retry: { enabled: false },
                });
                assert.equal((await collect(client.paginate(method, [...requiredArgs, placeholder], 2))).length, 2);
            });
        }
    }

    for (const [method, requiredArgs] of legacyMethods) {
        test(sdkVersion + ' ' + method + ' advances an already configured positional builder', async t => {
            mockPages(t);
            const params = makeParams(fixture.constructors[sdkVersion])
                .addPageLimit(2)
                .addPageOffset(0);
            const client = new Client({ baseUrl: 'https://example.test', retry: { enabled: false } });
            const pages = await collect(client.paginate(method, [...requiredArgs, 'de', params], 2));
            assert.deepEqual(pages.flat().map(item => item.id), ['item-0', 'item-1', 'item-2', 'item-3']);
        });
        for (const positionalLanguage of [false, true]) {
            test(sdkVersion + ' ' + method + ' extracts options.params with positional language ' + positionalLanguage, async t => {
                mockPages(t);
                const params = makeParams(fixture.constructors.v2);
                const options = { params, lang: 'de' };
                const args = positionalLanguage
                    ? [...requiredArgs, 'de', options]
                    : [...requiredArgs, options];
                const client = new Client({ baseUrl: 'https://example.test', retry: { enabled: false } });
                assert.equal((await collect(client.paginate(method, args, 2))).length, 2);
                assert.equal(options.params, params);
            });
        }
    }

    test(sdkVersion + ' recognizes a positional builder for modern getNodes', async t => {
        mockPages(t);
        const client = new Client({
            baseUrl: 'https://example.test',
            defaultLanguage: 'de',
            retry: { enabled: false },
        });
        const pages = await collect(client.paginate('getNodes', ['page', makeParams(fixture.constructors.v2)], 2));
        assert.equal(pages.length, 2);
    });

    test(sdkVersion + ' preserves the positional convention for custom methods', async () => {
        const client = new Client({ baseUrl: 'https://example.test' });
        const params = makeParams(fixture.constructors.v2Copy);
        const offsets = [];
        client.customList = async (marker, supplied) => {
            assert.equal(marker, 'marker');
            assert.equal(supplied, params);
            const offset = supplied.getQueryObject().page.offset;
            offsets.push(offset);
            return { data: [offset], links: { next: offset === 0 ? '/next' : undefined } };
        };
        assert.deepEqual(await collect(client.paginate('customList', ['marker', params], 2)), [[0], [2]]);
        assert.deepEqual(offsets, [0, 2]);
    });

    test(sdkVersion + ' preserves custom-method options.params convention', async () => {
        const client = new Client({ baseUrl: 'https://example.test' });
        const params = makeParams(fixture.constructors.v3);
        client.customList = async supplied => {
            assert.equal(supplied, params);
            return { data: [], links: {} };
        };
        assert.deepEqual(await collect(client.paginate('customList', [{ params }], 2)), [[]]);
    });

    test(sdkVersion + ' rejects non-pagination builders before requesting data', async t => {
        t.mock.method(globalThis, 'fetch', () => assert.fail('No request expected'));
        const client = new Client({ baseUrl: 'https://example.test' });
        for (const params of [{ getQueryString: () => '' }, {}, new Date(), 'filter[status]=1']) {
            await assert.rejects(
                collect(client.paginate('getNodes', ['page', { params }], 2)),
                error => error.name === 'ValidationError' && error.field === 'params'
            );
        }
    });

    test(sdkVersion + ' rejects invalid page sizes and method names', async t => {
        t.mock.method(globalThis, 'fetch', () => assert.fail('No request expected'));
        const client = new Client({ baseUrl: 'https://example.test' });
        for (const size of [0, -1, 1.5, NaN, Infinity, '2']) {
            await assert.rejects(
                collect(client.paginate('getNodes', ['page'], size)),
                error => error.name === 'ValidationError' && error.field === 'pageSize'
            );
        }
        await assert.rejects(
            collect(client.paginate('missingMethod', ['page'], 2)),
            error => error.name === 'ValidationError' && error.field === 'method'
        );
    });
}
