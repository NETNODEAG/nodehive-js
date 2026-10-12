import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));

export function createParamsFixture() {
    const root = mkdtempSync(path.join(tmpdir(), 'nodehive-params-test-'));
    const paramsRoots = {
        v2: path.dirname(require.resolve('drupal-jsonapi-params-v2/package.json')),
        v3: path.dirname(require.resolve('drupal-jsonapi-params/package.json')),
    };
    const sdkRoots = {};
    const constructors = {};

    for (const [version, paramsRoot] of Object.entries(paramsRoots)) {
        constructors[version] = require(paramsRoot).DrupalJsonApiParams;
        const sdkRoot = path.join(root, 'sdk-' + version);
        mkdirSync(path.join(sdkRoot, 'node_modules'), { recursive: true });
        for (const file of ['index.js', 'types.d.ts', 'package.json', 'src']) {
            cpSync(path.join(packageRoot, file), path.join(sdkRoot, file), { recursive: true });
        }
        symlinkSync(paramsRoot, path.join(sdkRoot, 'node_modules/drupal-jsonapi-params'), 'dir');
        sdkRoots[version] = sdkRoot;

        const duplicate = path.join(root, 'params-' + version + '-copy');
        cpSync(paramsRoot, duplicate, { recursive: true });
        mkdirSync(path.join(duplicate, 'node_modules'), { recursive: true });
        symlinkSync(
            path.dirname(require.resolve('qs/package.json')),
            path.join(duplicate, 'node_modules/qs'),
            'dir'
        );
        constructors[version + 'Copy'] = require(duplicate).DrupalJsonApiParams;
    }

    return {
        constructors,
        sdkRoots,
        async loadClient(version) {
            const module = await import(pathToFileURL(path.join(sdkRoots[version], 'index.js')));
            return module.NodeHiveClient;
        },
        consumerPath(sdkVersion, paramsVersion) {
            const dir = path.join(root, 'consumer-' + sdkVersion + '-' + paramsVersion);
            mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
            writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ type: 'module' }));
            symlinkSync(sdkRoots[sdkVersion], path.join(dir, 'node_modules/nodehive-js'), 'dir');
            symlinkSync(paramsRoots[paramsVersion], path.join(dir, 'node_modules/drupal-jsonapi-params'), 'dir');
            return path.join(dir, 'consumer.ts');
        },
        dispose() {
            rmSync(root, { recursive: true, force: true });
        },
    };
}
