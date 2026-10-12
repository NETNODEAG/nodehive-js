import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import ts from 'typescript';
import tsMin from 'typescript-min';
import { createParamsFixture } from './params-fixture.js';

const fixture = createParamsFixture();
after(() => fixture.dispose());
const consumers = {};
for (const sdk of ['v2', 'v3']) {
    for (const params of ['v2', 'v3']) {
        consumers[sdk + '/' + params] = fixture.consumerPath(sdk, params);
    }
}

const validConsumer = `
import { NodeHiveClient, JsonApiParamsLike, RequestOptions } from 'nodehive-js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const client = new NodeHiveClient({ baseUrl: 'https://example.test' });
const params = new DrupalJsonApiParams().addFilter('status', '1');
const structural: JsonApiParamsLike = params;
structural.addFilter('title', 'test').addSort('created', 'DESC').getQueryString();
structural.initialize(params).clone(params).getQueryObject();
structural.clear().addCustomParam({ extra: 'value' }).setQsOption({ encode: false }).getQsOption();
structural.initializeWithQueryObject({ filter: { status: '1' } })
    .initializeWithQueryString('filter[status]=1')
    .addGroup('visible', 'OR')
    .addInclude(['uid'])
    .addFields('node--page', ['title'])
    .addPageLimit(2)
    .addPageOffset(0);

client.getMedias('image', null, params);
client.getTaxonomies('tags', 'de', params);
client.getMedias('image', null, structural);
client.getNodes('page', { params });
client.getMediaList('image', { params, lang: 'de' });
client.getResourceBySlug('/page', { params: bundle => params.addFields('node--' + bundle, ['title']) });

const plain: RequestOptions = { params: { 'filter[status]': '1' } };
client.getNodes('page', plain);

type LegacyParams = NonNullable<Parameters<NodeHiveClient['getMedias']>[2]>;
const projected: LegacyParams = params;
projected.addSort('created').addFilter('status', '1').getQueryObject();

function configure<T extends JsonApiParamsLike>(input: T): T {
    return input.addFilter('status', '1').addSort('created');
}
const concrete: DrupalJsonApiParams = configure(params);
`;

function diagnostics(compiler, file, source, mode) {
    const options = {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        types: [],
        target: compiler.ScriptTarget.ES2022,
        module: mode === 'nodenext' ? compiler.ModuleKind.NodeNext : compiler.ModuleKind.ESNext,
        moduleResolution: mode === 'nodenext'
            ? compiler.ModuleResolutionKind.NodeNext
            : compiler.ModuleResolutionKind.Bundler,
    };
    const host = compiler.createCompilerHost(options);
    const original = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...args) => name === file
        ? compiler.createSourceFile(file, source, compiler.ScriptTarget.ES2022, true)
        : original(name, ...args);
    return compiler.getPreEmitDiagnostics(compiler.createProgram([file], options, host));
}

for (const compiler of [tsMin, ts]) {
    for (const mode of ['bundler', 'nodenext']) {
        for (const [versions, file] of Object.entries(consumers)) {
            test('TS ' + compiler.version + ' ' + mode + ' SDK/consumer ' + versions + ' accepts unchanged builder callers', () => {
                const errors = diagnostics(compiler, file, validConsumer, mode);
                assert.deepEqual(
                    errors.map(error => compiler.flattenDiagnosticMessageText(error.messageText, '\n')),
                    []
                );
            });
            test('TS ' + compiler.version + ' ' + mode + ' SDK/consumer ' + versions + ' keeps extracted legacy params structural, not nominal', () => {
                const source = validConsumer + `
function configureExtracted(input: LegacyParams): DrupalJsonApiParams {
    return input.addFilter('status', '1').addSort('created');
}
`;
                const errors = diagnostics(compiler, file, source, mode);
                assert.equal(errors.length, 1);
                assert.equal(errors[0].code, 2739);
            });
            test('TS ' + compiler.version + ' ' + mode + ' SDK/consumer ' + versions + ' rejects unsuitable legacy params', () => {
                const source = validConsumer + `
client.getMedias('image', null, new Date());
client.getTaxonomies('tags', null, { getQueryString: () => '' });
`;
                const errors = diagnostics(compiler, file, source, mode);
                assert.equal(errors.length, 2);
                assert.ok(errors.every(error => error.code === 2345));
            });
        }
    }
}
