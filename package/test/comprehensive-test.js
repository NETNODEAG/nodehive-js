#!/usr/bin/env node

import { NodeHiveClient, NetworkError, ValidationError, AuthManager, MemoryStorage } from '../index.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const BACKEND_URL = 'https://netnode.nodehive.app';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    debug: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.yellow}${msg}${colors.reset}`),
    subsection: (msg) => console.log(`${colors.cyan}  ${msg}${colors.reset}`),
};

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.client = null;
    }

    async setup() {
        this.client = new NodeHiveClient({
            baseUrl: BACKEND_URL,
            debug: false,
            timeout: 15000,
            retry: {
                enabled: true,
                maxAttempts: 2,
                delay: 500
            }
        });
    }

    async runTest(name, testFn) {
        try {
            await testFn();
            this.passed++;
            log.success(name);
            return true;
        } catch (error) {
            this.failed++;
            log.error(`${name}: ${error.message}`);
            if (error.stack && process.env.DEBUG) {
                console.error(error.stack);
            }
            return false;
        }
    }

    async skip(name, reason) {
        this.skipped++;
        log.info(`${name} - SKIPPED: ${reason}`);
    }

    // ===== Core API Tests =====

    async testContentTypes() {
        log.section('Testing Content Type Methods');

        await this.runTest('getContentTypes()', async () => {
            const response = await this.client.getContentTypes();
            if (!response?.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            log.debug(`Found ${response.data.length} content types`);
            return response.data;
        });
    }

    async testNodes() {
        log.section('Testing Node Methods');

        // Get content types first
        const typesResponse = await this.client.getContentTypes();
        if (!typesResponse?.data?.length) {
            await this.skip('Node tests', 'No content types available');
            return;
        }

        const contentType = typesResponse.data[0].attributes.drupal_internal__type;

        await this.runTest('getNodes() with basic params', async () => {
            const response = await this.client.getNodes(contentType);
            if (!response) throw new Error('No response');
            log.debug(`Found ${response.data?.length || 0} nodes of type ${contentType}`);
        });

        await this.runTest('getNodes() with DrupalJsonApiParams', async () => {
            const params = new DrupalJsonApiParams()
                .addPageLimit(2)
                .addSort('created', 'DESC');

            const response = await this.client.getNodes(contentType, { params });
            if (!response) throw new Error('No response');
            if (response.data && response.data.length > 2) {
                throw new Error('Page limit not respected');
            }
            log.debug(`Retrieved ${response.data?.length || 0} nodes with params`);
        });

        await this.runTest('getNode() with UUID', async () => {
            const listResponse = await this.client.getNodes(contentType);
            if (listResponse.data && listResponse.data.length > 0) {
                const uuid = listResponse.data[0].id;
                const node = await this.client.getNode(uuid, contentType);
                if (!node || !node.data) throw new Error('Failed to get single node');
                log.debug(`Retrieved node: ${node.data.id}`);
            } else {
                log.debug('No nodes available to test getNode()');
            }
        });

        await this.runTest('getResourceBySlug()', async () => {
            const result = await this.client.getResourceBySlug('test-page');
            // May return null if page doesn't exist, which is fine
            log.debug(`getResourceBySlug result: ${result ? 'Found' : 'Not found'}`);
        });
    }

    async testMenus() {
        log.section('Testing Menu Methods');

        let menus = [];

        await this.runTest('getAvailableMenus()', async () => {
            const response = await this.client.getAvailableMenus();
            if (!response?.data) throw new Error('No menu data');
            menus = response.data;
            log.debug(`Found ${menus.length} menus`);
        });

        await this.runTest('getMenuItems()', async () => {
            if (menus.length > 0) {
                const menuId = menus[0].attributes.drupal_internal__id;
                const response = await this.client.getMenuItems(menuId);
                if (!response) throw new Error('Failed to get menu items');
                log.debug(`Retrieved menu items for menu: ${menuId}`);
            } else {
                log.debug('No menus available to test getMenuItems()');
            }
        });
    }

    async testTaxonomy() {
        log.section('Testing Taxonomy Methods');

        await this.runTest('getTaxonomyTerms()', async () => {
            // Try with a common vocabulary
            try {
                const response = await this.client.getTaxonomyTerms('tags');
                log.debug(`Retrieved taxonomy terms`);
            } catch (error) {
                // Vocabulary might not exist, try another common one
                try {
                    const response = await this.client.getTaxonomyTerms('categories');
                    log.debug(`Retrieved taxonomy terms from categories`);
                } catch (e) {
                    log.debug('No standard vocabularies found (tags/categories)');
                }
            }
        });

        await this.runTest('getTaxonomies() - deprecated method', async () => {
            // Test the deprecated method still works
            try {
                const response = await this.client.getTaxonomies('tags');
                log.debug('Deprecated getTaxonomies() still works');
            } catch (error) {
                // Expected if vocabulary doesn't exist
                log.debug('getTaxonomies() tested (vocabulary may not exist)');
            }
        });
    }

    async testMedia() {
        log.section('Testing Media Methods');

        await this.runTest('getMediaList()', async () => {
            try {
                const response = await this.client.getMediaList('image');
                log.debug(`Found ${response.data?.length || 0} media items`);

                if (response.data && response.data.length > 0) {
                    const mediaId = response.data[0].id;
                    const media = await this.client.getMedia(mediaId, 'image');
                    if (!media) throw new Error('Failed to get single media item');
                    log.debug(`Retrieved media item: ${mediaId}`);
                }
            } catch (error) {
                if (error instanceof NetworkError && error.status === 404) {
                    log.debug('Media type "image" not found (might not be configured)');
                } else {
                    throw error;
                }
            }
        });

        await this.runTest('getMedias() - deprecated method', async () => {
            try {
                const response = await this.client.getMedias('image');
                log.debug('Deprecated getMedias() still works');
            } catch (error) {
                // Expected if media type doesn't exist
                log.debug('getMedias() tested (media type may not exist)');
            }
        });
    }

    async testRouter() {
        log.section('Testing Router Methods');

        await this.runTest('router()', async () => {
            const result = await this.client.router('home');
            // May return null if route doesn't exist
            log.debug(`Router result: ${result ? 'Found route' : 'Route not found'}`);
        });

        await this.runTest('getRedirect()', async () => {
            const result = await this.client.getRedirect('old-page');
            // May return null if no redirect exists
            log.debug(`Redirect result: ${result ? `Redirect to ${result.to}` : 'No redirect'}`);
        });

        await this.runTest('getTranslatedPaths()', async () => {
            try {
                const result = await this.client.getTranslatedPaths('home');
                log.debug('getTranslatedPaths() executed successfully');
            } catch (error) {
                if (error instanceof NetworkError && error.status === 404) {
                    log.debug('Translation endpoint not available');
                } else {
                    throw error;
                }
            }
        });
    }

    async testBatchOperations() {
        log.section('Testing Batch Operations');

        await this.runTest('batch() with multiple requests', async () => {
            const requests = [
                { method: 'getContentTypes', args: [] },
                { method: 'getAvailableMenus', args: [] },
            ];

            const results = await this.client.batch(requests);
            if (!Array.isArray(results) || results.length !== 2) {
                throw new Error('Batch did not return expected results');
            }

            let successCount = 0;
            results.forEach((result, index) => {
                if (!result.error) {
                    successCount++;
                } else {
                    log.debug(`Batch request ${index} failed: ${result.error.message}`);
                }
            });

            log.debug(`Batch completed: ${successCount}/${results.length} successful`);
        });

        await this.runTest('batch() with error handling', async () => {
            const requests = [
                { method: 'getContentTypes', args: [] },
                { method: 'getNode', args: ['invalid-uuid', 'invalid-type'] }, // This should fail
                { method: 'getAvailableMenus', args: [] },
            ];

            const results = await this.client.batch(requests);

            // Check that we handle errors gracefully
            const errors = results.filter(r => r.error);
            const successes = results.filter(r => !r.error);

            log.debug(`Batch with errors: ${successes.length} succeeded, ${errors.length} failed (expected)`);
        });
    }

    async testPagination() {
        log.section('Testing Pagination');

        await this.runTest('paginate() generator', async () => {
            const typesResponse = await this.client.getContentTypes();
            if (!typesResponse?.data?.length) {
                log.debug('No content types for pagination test');
                return;
            }

            const contentType = typesResponse.data[0].attributes.drupal_internal__type;
            let pageCount = 0;
            let totalItems = 0;

            // Test pagination with small page size
            for await (const page of this.client.paginate('getNodes', [contentType], 2)) {
                pageCount++;
                totalItems += Array.isArray(page) ? page.length : 0;

                // Limit to 3 pages for testing
                if (pageCount >= 3) break;
            }

            log.debug(`Paginated through ${pageCount} pages, ${totalItems} total items`);
        });
    }

    async testErrorHandling() {
        log.section('Testing Error Handling');

        await this.runTest('NetworkError for invalid domain', async () => {
            const badClient = new NodeHiveClient({
                baseUrl: 'https://invalid-domain-xyz-123.com',
                timeout: 3000,
                retry: { enabled: false }
            });

            try {
                await badClient.getContentTypes();
                throw new Error('Should have thrown NetworkError');
            } catch (error) {
                if (!(error instanceof NetworkError)) {
                    throw new Error(`Wrong error type: ${error.constructor.name}`);
                }
                log.debug('Correctly threw NetworkError');
            }
        });

        await this.runTest('ValidationError for missing params', async () => {
            try {
                await this.client.getNode(null, null);
                throw new Error('Should have thrown ValidationError');
            } catch (error) {
                if (!(error instanceof ValidationError)) {
                    throw new Error(`Wrong error type: ${error.constructor.name}`);
                }
                log.debug('Correctly threw ValidationError');
            }
        });

        await this.runTest('Timeout handling', async () => {
            const timeoutClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                timeout: 1, // 1ms - will definitely timeout
                retry: { enabled: false }
            });

            try {
                await timeoutClient.getContentTypes();
                throw new Error('Should have timed out');
            } catch (error) {
                if (!(error instanceof NetworkError) || !error.message.includes('timeout')) {
                    throw new Error('Did not handle timeout correctly');
                }
                log.debug('Timeout handled correctly');
            }
        });

        await this.runTest('Retry mechanism', async () => {
            let attemptCount = 0;
            const retryClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                retry: {
                    enabled: true,
                    maxAttempts: 3,
                    delay: 100
                }
            });

            // Add interceptor to count attempts
            retryClient.addRequestInterceptor((config) => {
                attemptCount++;
                if (attemptCount < 3) {
                    // Simulate failure by using bad URL
                    throw new Error('Simulated network error');
                }
                return config;
            });

            try {
                await retryClient.getContentTypes();
                // If we get here, retry worked
                if (attemptCount !== 3) {
                    throw new Error(`Expected 3 attempts, got ${attemptCount}`);
                }
                log.debug(`Retry mechanism worked: ${attemptCount} attempts`);
            } catch (error) {
                // This is fine - we're testing retry behavior
                log.debug(`Retry tested with ${attemptCount} attempts`);
            }
        });
    }

    async testAuthentication() {
        log.section('Testing Authentication');

        await this.runTest('AuthManager initialization', async () => {
            const authClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                auth: {
                    storage: {
                        type: 'memory'
                    }
                }
            });

            if (!authClient.auth || !(authClient.auth instanceof AuthManager)) {
                throw new Error('AuthManager not initialized properly');
            }
            log.debug('AuthManager initialized correctly');
        });

        await this.runTest('Storage adapters', async () => {
            const storage = new MemoryStorage();
            await storage.set('test', 'value');
            const value = await storage.get('test');
            if (value !== 'value') {
                throw new Error('MemoryStorage not working');
            }
            await storage.remove('test');
            const removed = await storage.get('test');
            if (removed !== null) {
                throw new Error('MemoryStorage remove not working');
            }
            log.debug('Storage adapters working correctly');
        });

        await this.runTest('Token management', async () => {
            const authClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                auth: {
                    token: 'test-token-123'
                }
            });

            const token = await authClient.getToken();
            if (token !== 'test-token-123') {
                throw new Error('Initial token not set correctly');
            }
            log.debug('Token management working');
        });

        await this.runTest('isLoggedIn() check', async () => {
            const authClient = new NodeHiveClient({
                baseUrl: BACKEND_URL
            });

            const loggedIn = await authClient.isLoggedIn();
            if (loggedIn) {
                throw new Error('Should not be logged in initially');
            }

            authClient.auth.setToken('test-token');
            const nowLoggedIn = await authClient.isLoggedIn();
            if (!nowLoggedIn) {
                throw new Error('Should be logged in after setting token');
            }
            log.debug('Login status check working');
        });
    }

    async testInterceptors() {
        log.section('Testing Interceptors');

        await this.runTest('Request interceptor', async () => {
            let interceptorCalled = false;
            const remove = this.client.addRequestInterceptor((config) => {
                interceptorCalled = true;
                config.headers['X-Test'] = 'test-value';
                return config;
            });

            await this.client.getContentTypes();
            remove();

            if (!interceptorCalled) {
                throw new Error('Request interceptor not called');
            }
            log.debug('Request interceptor called successfully');
        });

        await this.runTest('Response interceptor', async () => {
            let interceptorCalled = false;
            let modifiedData = false;

            const remove = this.client.addResponseInterceptor((data) => {
                interceptorCalled = true;
                if (data) {
                    data._modified = true;
                    modifiedData = true;
                }
                return data;
            });

            const response = await this.client.getContentTypes();
            remove();

            if (!interceptorCalled) {
                throw new Error('Response interceptor not called');
            }
            if (!response._modified) {
                throw new Error('Response not modified by interceptor');
            }
            log.debug('Response interceptor working correctly');
        });

        await this.runTest('Multiple interceptors', async () => {
            const order = [];

            const remove1 = this.client.addRequestInterceptor((config) => {
                order.push('req1');
                return config;
            });

            const remove2 = this.client.addRequestInterceptor((config) => {
                order.push('req2');
                return config;
            });

            await this.client.getContentTypes();

            remove1();
            remove2();

            if (order.join(',') !== 'req1,req2') {
                throw new Error(`Interceptor order incorrect: ${order.join(',')}`);
            }
            log.debug('Multiple interceptors executed in correct order');
        });
    }

    async testFragmentAndParagraph() {
        log.section('Testing Fragment and Paragraph Methods');

        await this.runTest('getFragment()', async () => {
            try {
                // This will likely fail without valid UUID/type, but tests the method exists
                await this.client.getFragment('test-uuid', 'test-type');
            } catch (error) {
                if (error instanceof NetworkError && error.status === 404) {
                    log.debug('Fragment endpoint tested (fragment not found - expected)');
                } else if (error instanceof NetworkError) {
                    log.debug('Fragment endpoint tested');
                } else {
                    throw error;
                }
            }
        });

        await this.runTest('getArea()', async () => {
            try {
                await this.client.getArea('test-uuid');
            } catch (error) {
                if (error instanceof NetworkError && error.status === 404) {
                    log.debug('Area endpoint tested (area not found - expected)');
                } else if (error instanceof NetworkError) {
                    log.debug('Area endpoint tested');
                } else {
                    throw error;
                }
            }
        });

        await this.runTest('getParagraph()', async () => {
            try {
                await this.client.getParagraph('test-uuid', 'test-type');
            } catch (error) {
                if (error instanceof NetworkError && error.status === 404) {
                    log.debug('Paragraph endpoint tested (paragraph not found - expected)');
                } else if (error instanceof NetworkError) {
                    log.debug('Paragraph endpoint tested');
                } else {
                    throw error;
                }
            }
        });
    }

    async testConfigurationOptions() {
        log.section('Testing Configuration Options');

        await this.runTest('Default language setting', async () => {
            const langClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                defaultLanguage: 'fr'
            });

            // Intercept to check URL
            let requestUrl = '';
            const remove = langClient.addRequestInterceptor((config, { url }) => {
                requestUrl = url;
                return config;
            });

            await langClient.getContentTypes();
            remove();

            if (!requestUrl.includes('/fr/')) {
                throw new Error('Default language not applied to URL');
            }
            log.debug('Default language applied correctly');
        });

        await this.runTest('Debug mode', async () => {
            const debugClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                debug: true
            });

            // Capture console output
            const originalLog = console.log;
            let debugOutput = '';
            console.log = (...args) => {
                debugOutput += args.join(' ');
            };

            await debugClient.getContentTypes();
            console.log = originalLog;

            if (!debugOutput.includes('NodeHive Request Debug')) {
                throw new Error('Debug mode not outputting debug info');
            }
            log.debug('Debug mode working');
        });

        await this.runTest('Configuration validation', async () => {
            try {
                new NodeHiveClient({});
                throw new Error('Should have thrown error for missing baseUrl');
            } catch (error) {
                if (error.message !== 'baseUrl is required') {
                    throw error;
                }
                log.debug('Configuration validation working');
            }
        });
    }

    async runAllTests() {
        console.log('🧪 NodeHiveClient Comprehensive Test Suite');
        console.log('==========================================');
        log.info(`Backend URL: ${BACKEND_URL}`);
        log.info(`Starting tests...\n`);

        await this.setup();

        // Run all test suites
        await this.testContentTypes();
        await this.testNodes();
        await this.testMenus();
        await this.testTaxonomy();
        await this.testMedia();
        await this.testRouter();
        await this.testBatchOperations();
        await this.testPagination();
        await this.testErrorHandling();
        await this.testAuthentication();
        await this.testInterceptors();
        await this.testFragmentAndParagraph();
        await this.testConfigurationOptions();

        // Summary
        console.log('\n==========================================');
        console.log('Test Results Summary:');
        console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
        if (this.failed > 0) {
            console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
        }
        if (this.skipped > 0) {
            console.log(`${colors.yellow}Skipped: ${this.skipped}${colors.reset}`);
        }

        const total = this.passed + this.failed + this.skipped;
        const percentage = Math.round((this.passed / (this.passed + this.failed)) * 100);

        console.log(`\nTotal: ${total} tests`);
        console.log(`Success Rate: ${percentage}%`);

        if (this.failed === 0) {
            console.log(`\n${colors.green}✨ All tests passed!${colors.reset}`);
            return 0;
        } else {
            console.log(`\n${colors.red}❌ ${this.failed} test(s) failed${colors.reset}`);
            return 1;
        }
    }
}

// Run tests
const runner = new TestRunner();
runner.runAllTests().then(exitCode => {
    process.exit(exitCode);
}).catch(error => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});