#!/usr/bin/env node

import { NodeHiveClient, NetworkError } from '../index.js';

const BACKEND_URL = 'https://netnode.nodehive.app';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    debug: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.yellow}${msg}${colors.reset}`),
};

async function testGetContentTypes(client) {
    log.section('Testing getContentTypes()');

    try {
        const response = await client.getContentTypes();

        if (!response || !response.data) {
            throw new Error('Invalid response structure');
        }

        if (!Array.isArray(response.data)) {
            throw new Error('Response data is not an array');
        }

        log.success(`Retrieved ${response.data.length} content types`);

        // Show first 3 content types
        response.data.slice(0, 3).forEach(type => {
            log.debug(`- ${type.attributes.name} (${type.id})`);
        });

        if (response.data.length > 3) {
            log.debug(`... and ${response.data.length - 3} more`);
        }

        return response.data;
    } catch (error) {
        log.error(`getContentTypes failed: ${error.message}`);
        throw error;
    }
}

async function testGetNodes(client, contentType) {
    log.section(`Testing getNodes('${contentType}')`);

    try {
        const response = await client.getNodes(contentType);

        if (!response) {
            throw new Error('Invalid response structure');
        }

        log.success(`Retrieved ${response.data?.length || 0} nodes of type '${contentType}'`);

        if (response.data && response.data.length > 0) {
            const firstNode = response.data[0];
            log.debug(`First node: ${firstNode.attributes?.title || firstNode.id}`);
        }

        return response;
    } catch (error) {
        log.error(`getNodes failed: ${error.message}`);
        throw error;
    }
}

async function testErrorHandling() {
    log.section('Testing error handling');

    try {
        const badClient = new NodeHiveClient({
            baseUrl: 'https://invalid-domain-that-does-not-exist.com',
            timeout: 3000,
            retry: { enabled: false }
        });

        await badClient.getContentTypes();
        log.error('Should have thrown an error for invalid domain');
        return false;
    } catch (error) {
        if (error instanceof NetworkError) {
            log.success('Correctly threw NetworkError for invalid domain');
            log.debug(`Error message: ${error.message}`);
            return true;
        } else {
            log.error(`Wrong error type: ${error.constructor.name}`);
            return false;
        }
    }
}

async function testInterceptors(client) {
    log.section('Testing interceptors');

    let requestCalled = false;
    let responseCalled = false;

    const removeRequest = client.addRequestInterceptor((config) => {
        requestCalled = true;
        return config;
    });

    const removeResponse = client.addResponseInterceptor((data) => {
        responseCalled = true;
        return data;
    });

    try {
        await client.getContentTypes();

        if (requestCalled && responseCalled) {
            log.success('Both request and response interceptors were called');
        } else {
            throw new Error(`Interceptors not called properly (request: ${requestCalled}, response: ${responseCalled})`);
        }

        // Clean up
        removeRequest();
        removeResponse();

        return true;
    } catch (error) {
        log.error(`Interceptor test failed: ${error.message}`);
        removeRequest();
        removeResponse();
        throw error;
    }
}

async function testNewConstructor() {
    log.section('Testing new constructor options');

    try {
        const client = new NodeHiveClient({
            baseUrl: BACKEND_URL,
            debug: false,
            defaultLanguage: 'en',
            timeout: 15000,
            retry: {
                enabled: true,
                maxAttempts: 2,
                delay: 500
            }
        });

        await client.getContentTypes();
        log.success('New constructor with options object works correctly');

        // Test backwards compatibility
        const legacyClient = new NodeHiveClient(BACKEND_URL, {}, { debug: false });
        await legacyClient.getContentTypes();
        log.success('Legacy constructor still works (with deprecation warning)');

        return true;
    } catch (error) {
        log.error(`Constructor test failed: ${error.message}`);
        throw error;
    }
}

async function runAllTests() {
    console.log('🧪 NodeHiveClient Integration Tests');
    console.log('=====================================');
    log.info(`Backend URL: ${BACKEND_URL}`);

    let passed = 0;
    let failed = 0;

    const client = new NodeHiveClient({
        baseUrl: BACKEND_URL,
        debug: false,
        timeout: 10000,
        retry: {
            enabled: true,
            maxAttempts: 2,
            delay: 500
        }
    });

    // Test 1: Get content types
    try {
        const contentTypes = await testGetContentTypes(client);
        passed++;

        // Test 2: Get nodes (using first available content type)
        if (contentTypes.length > 0) {
            const contentType = contentTypes[0].attributes.drupal_internal__type;
            await testGetNodes(client, contentType);
            passed++;
        } else {
            log.info('Skipping getNodes test - no content types available');
        }
    } catch (error) {
        failed++;
    }

    // Test 3: Error handling
    try {
        await testErrorHandling();
        passed++;
    } catch (error) {
        failed++;
    }

    // Test 4: Interceptors
    try {
        await testInterceptors(client);
        passed++;
    } catch (error) {
        failed++;
    }

    // Test 5: Constructor options
    try {
        await testNewConstructor();
        passed++;
    } catch (error) {
        failed++;
    }

    // Summary
    console.log('\n=====================================');
    console.log('Test Results:');
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    if (failed > 0) {
        console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    }

    if (failed === 0) {
        console.log(`\n${colors.green}✨ All tests passed!${colors.reset}`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});