import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createParamsFixture } from './params-fixture.js';

const fixture = createParamsFixture();
after(() => fixture.dispose());

for (const sdk of ['v2', 'v3']) {
    const Client = await fixture.loadClient(sdk);
    for (const [version, Params] of Object.entries(fixture.constructors)) {
        for (const [method, args, entity] of [
            ['getNodes', ['page'], 'node-page'],
            ['getNode', ['uuid', 'page'], 'node-page'],
            ['getMediaList', ['image'], 'media--image'],
            ['getTaxonomyTerms', ['tags'], 'taxonomy_term--tags'],
            ['getMenuLinkEntities', ['main'], 'menu_link_content'],
            ['getMedias', ['image', 'de'], 'media--image'],
            ['getTaxonomies', ['tags', 'de'], 'taxonomy_term--tags'],
        ]) {
            test(sdk + '/' + version + ' direct ' + method + ' preserves provided query and configured includes', async t => {
                t.mock.method(console, 'warn', () => {});
                const params = new Params()
                    .addFilter('status', '1')
                    .addInclude(['field_image'])
                    .addFields('node--page', ['title'])
                    .addSort('created', 'DESC')
                    .addPageLimit(5)
                    .addPageOffset(7);
                let requested;
                t.mock.method(globalThis, 'fetch', async input => {
                    requested = new URL(input);
                    return new Response(JSON.stringify({ data: [] }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                });
                const client = new Client({
                    baseUrl: 'https://example.test',
                    retry: { enabled: false },
                    config: { entities: { [entity]: { addInclude: ['uid'], addFields: ['label'] } } },
                });
                const legacy = method === 'getMedias' || method === 'getTaxonomies';
                await client[method](...args, legacy ? params : { params, lang: 'de' });
                assert.ok(requested.pathname.startsWith('/de/jsonapi/'));
                assert.equal(requested.searchParams.get('filter[status]'), '1');
                assert.equal(requested.searchParams.get('sort'), '-created');
                assert.equal(requested.searchParams.get('page[limit]'), '5');
                assert.equal(requested.searchParams.get('page[offset]'), '7');
                assert.ok(requested.searchParams.get('include').split(',').includes('uid'));
                assert.equal(requested.searchParams.get('fields[' + entity + ']'), 'label');
            });
        }
    }

    test(sdk + ' preserves modern plain query object support', async t => {
        let requested;
        t.mock.method(globalThis, 'fetch', async input => {
            requested = new URL(input);
            return new Response(JSON.stringify({ data: [] }));
        });
        const client = new Client({ baseUrl: 'https://example.test' });
        await client.getNodes('page', { params: { 'filter[status]': '1', 'page[limit]': 5 } });
        assert.equal(requested.searchParams.get('filter[status]'), '1');
        assert.equal(requested.searchParams.get('page[limit]'), '5');
    });
}

const configurations = [
    params => params,
    params => params.addFilter('status', '1'),
    params => params.addInclude(['field_image', 'uid']).addFields('node--page', ['title', 'path']),
    params => params.addSort('created', 'DESC').addPageLimit(50).addPageOffset(100),
    params => params.addGroup('visible', 'OR')
        .addFilter('type', ['page', 'article'], 'IN')
        .addFilter('title', 'A & B', 'CONTAINS', 'visible'),
    params => params.initializeWithQueryString('filter[status]=1&sort=-created&include=uid'),
    params => params.addCustomParam({ custom: ['one', 'two'] }),
];
for (const [index, configure] of configurations.entries()) {
    for (const options of [undefined, { encode: false }]) {
        test('v2/v3 serialization parity case ' + index + ', encode ' + options?.encode, () => {
            const v2 = configure(new fixture.constructors.v2()).getQueryString(options);
            const v3 = configure(new fixture.constructors.v3()).getQueryString(options);
            assert.equal(v2, v3);
        });
    }
}

test('captures the intentional empty query-object shape difference', () => {
    const v2 = new fixture.constructors.v2();
    const v3 = new fixture.constructors.v3();
    assert.deepEqual(v2.getQueryObject(), { filter: {}, include: [], sort: [], fields: {} });
    assert.deepEqual(v3.getQueryObject(), { filter: {}, fields: {} });
    assert.equal(v2.getQueryString({ allowEmptyArrays: true }), 'include[]&sort[]');
    assert.equal(v3.getQueryString({ allowEmptyArrays: true }), '');
});
