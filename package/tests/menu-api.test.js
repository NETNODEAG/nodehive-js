/**
 * Menu API v1 Tests
 * Tests for the new getMenu() method
 */

import { NodeHiveClient } from '../index.js';

const BASE_URL = process.env.NODEHIVE_BASE_URL || 'https://netnode.nodehive.app';

// Test utilities
function log(emoji, message) {
    console.log(`${emoji} ${message}`);
}

function success(message) {
    log('✓', `[32m${message}[0m`);
}

function error(message) {
    log('✗', `[31m${message}[0m`);
}

function info(message) {
    log('ℹ', `[34m${message}[0m`);
}

/**
 * Test Suite: Menu API v1
 */
async function runMenuApiTests() {
    console.log('\n[1m[36m━━━ Menu API v1 Tests ━━━[0m\n');

    const client = new NodeHiveClient({
        baseUrl: BASE_URL,
        debug: false
    });

    let passed = 0;
    let failed = 0;

    // Test 1: getMenu() method exists
    try {
        if (typeof client.getMenu === 'function') {
            success('getMenu() method exists');
            passed++;
        } else {
            error('getMenu() method not found');
            failed++;
        }
    } catch (err) {
        error(`getMenu() method check failed: ${err.message}`);
        failed++;
    }

    // Test 2: Fetch menu by ID
    try {
        const menu = await client.getMenu('20jahre-main', { lang: 'de' });

        if (menu && menu.menu_id === '20jahre-main') {
            success('getMenu() returns correct menu_id');
            passed++;
        } else {
            error('getMenu() returned invalid menu_id');
            failed++;
        }

        if (menu.language === 'de') {
            success('getMenu() returns correct language');
            passed++;
        } else {
            error('getMenu() returned invalid language');
            failed++;
        }

        if (Array.isArray(menu.data)) {
            success('getMenu() returns data array');
            passed++;
        } else {
            error('getMenu() data is not an array');
            failed++;
        }

        if (menu.data.length > 0) {
            success(`getMenu() returned ${menu.data.length} menu items`);
            passed++;
        } else {
            error('getMenu() returned empty data array');
            failed++;
        }

    } catch (err) {
        error(`getMenu() failed: ${err.message}`);
        failed++;
    }

    // Test 3: Menu item structure validation
    try {
        const menu = await client.getMenu('20jahre-main', { lang: 'de' });
        const firstItem = menu.data[0];

        if (firstItem.title) {
            success('Menu item has title');
            passed++;
        } else {
            error('Menu item missing title');
            failed++;
        }

        if (firstItem.url) {
            success('Menu item has url');
            passed++;
        } else {
            error('Menu item missing url');
            failed++;
        }

        if (typeof firstItem.enabled === 'boolean') {
            success('Menu item has enabled boolean');
            passed++;
        } else {
            error('Menu item enabled is not boolean');
            failed++;
        }

        if (typeof firstItem.expanded === 'boolean') {
            success('Menu item has expanded boolean');
            passed++;
        } else {
            error('Menu item expanded is not boolean');
            failed++;
        }

        if (firstItem.weight !== undefined) {
            success('Menu item has weight');
            passed++;
        } else {
            error('Menu item missing weight');
            failed++;
        }

    } catch (err) {
        error(`Menu item validation failed: ${err.message}`);
        failed++;
    }

    // Test 4: Language override
    try {
        const menuDe = await client.getMenu('20jahre-main', { lang: 'de' });
        const menuEn = await client.getMenu('20jahre-main', { lang: 'en' });

        if (menuDe.language === 'de' && menuEn.language === 'en') {
            success('Language override works correctly');
            passed++;
        } else {
            error('Language override failed');
            failed++;
        }
    } catch (err) {
        error(`Language override test failed: ${err.message}`);
        failed++;
    }

    // Test 5: Verify other menu methods still work
    try {
        if (typeof client.getMenus === 'function') {
            success('getMenus() method still exists');
            passed++;
        }
        if (typeof client.getMenuLinks === 'function') {
            success('getMenuLinks() method still exists');
            passed++;
        }
        if (typeof client.getMenuTree === 'function') {
            success('getMenuTree() method still exists');
            passed++;
        }
    } catch (err) {
        error(`Method existence check failed: ${err.message}`);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Refactoring Verification
 */
async function runRefactoringTests() {
    console.log('\n[1m[36m━━━ Refactoring Verification Tests ━━━[0m\n');

    const client = new NodeHiveClient({
        baseUrl: BASE_URL,
        debug: false
    });

    let passed = 0;
    let failed = 0;

    // Verify all method categories still work
    const methodGroups = {
        'Content': ['getContentTypes', 'getNodes', 'getNode', 'getResourceBySlug'],
        'Menu': ['getMenus', 'getMenuLinks', 'getMenuTree', 'getMenu'],
        'Taxonomy': ['getTaxonomyVocabularies', 'getTaxonomyTerms', 'getTaxonomyTerm'],
        'Media': ['getMedia', 'getMediaList'],
        'Text': ['getTexts', 'getText'],
        'Fragment': ['getFragment', 'getArea'],
        'Paragraph': ['getParagraph'],
        'Router': ['router', 'getRouteByPath', 'translatePath', 'getPathAliases', 'getRedirects', 'getRedirect', 'getTranslatedPaths'],
        'Batch': ['batch', 'paginate']
    };

    for (const [category, methods] of Object.entries(methodGroups)) {
        info(`Checking ${category} methods...`);
        for (const method of methods) {
            if (typeof client[method] === 'function') {
                success(`  ${method}() exists`);
                passed++;
            } else {
                error(`  ${method}() missing!`);
                failed++;
            }
        }
    }

    return { passed, failed };
}

/**
 * Run all tests
 */
async function main() {
    console.log('[1m[35m🧪 Menu API & Refactoring Tests[0m');
    console.log('══════════════════════════════════════════════════');
    console.log(`[34mBackend: ${BASE_URL}[0m`);
    console.log('══════════════════════════════════════════════════');

    const startTime = Date.now();

    // Run test suites
    const menuResults = await runMenuApiTests();
    const refactoringResults = await runRefactoringTests();

    // Calculate totals
    const totalPassed = menuResults.passed + refactoringResults.passed;
    const totalFailed = menuResults.failed + refactoringResults.failed;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print summary
    console.log('\n══════════════════════════════════════════════════');
    console.log('[1m[35mFINAL SUMMARY[0m');
    console.log('══════════════════════════════════════════════════');
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`[32mPassed: ${totalPassed}[0m`);
    console.log(`[31mFailed: ${totalFailed}[0m`);
    console.log(`Duration: ${duration}s`);
    console.log('══════════════════════════════════════════════════\n');

    if (totalFailed === 0) {
        console.log('[1m[32m✅ All tests passed![0m\n');
        process.exit(0);
    } else {
        console.log(`[1m[31m❌ ${totalFailed} test(s) failed[0m\n`);
        process.exit(1);
    }
}

// Run tests
main().catch(err => {
    console.error('[31mTest suite crashed:[0m', err);
    process.exit(1);
});
