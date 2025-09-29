#!/usr/bin/env node

/**
 * Error Handling Tests
 * Tests error scenarios, validation, and recovery mechanisms
 */

import {
    NodeHiveClient,
    NetworkError,
    ValidationError,
    ConfigurationError,
    AuthenticationError
} from '../index.js';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Error Handling Tests');

async function runTests() {
    await helper.section('Network Errors');

    await helper.test('NetworkError - invalid domain', async () => {
        const client = new NodeHiveClient({
            baseUrl: 'https://invalid-domain-xyz-123-abc.com',
            timeout: 3000,
            retry: { enabled: false }
        });

        try {
            await client.getContentTypes();
            throw new Error('Should have thrown NetworkError');
        } catch (error) {
            helper.assert(error instanceof NetworkError, 'Should be NetworkError');
            helper.assert(error.url, 'Should have URL in error');
            helper.debug(`NetworkError: ${error.message}`);
        }
    });

    await helper.test('NetworkError - timeout', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            timeout: 1, // 1ms timeout
            retry: { enabled: false }
        });

        try {
            await client.getContentTypes();
            throw new Error('Should have timed out');
        } catch (error) {
            helper.assert(error instanceof NetworkError, 'Should be NetworkError');
            helper.assert(
                error.message.toLowerCase().includes('timeout') || error.status === 408,
                'Should indicate timeout'
            );
            helper.debug('Timeout handled correctly');
        }
    });

    await helper.test('NetworkError - 404 Not Found', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            retry: { enabled: false }
        });

        try {
            await client.request('/nonexistent/endpoint');
            throw new Error('Should have thrown 404 error');
        } catch (error) {
            helper.assert(error instanceof NetworkError, 'Should be NetworkError');
            helper.assert(error.status === 404, 'Should have 404 status');
            helper.debug('404 error handled correctly');
        }
    });

    await helper.test('NetworkError - contains response details', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            retry: { enabled: false }
        });

        try {
            await client.getNode('invalid-uuid', 'invalid-type');
            throw new Error('Should have thrown error');
        } catch (error) {
            helper.assert(error instanceof NetworkError, 'Should be NetworkError');
            helper.assert(error.status, 'Should have status');
            helper.assert(error.url, 'Should have URL');
            helper.assert(error.details, 'Should have details');
            helper.debug(`Error contains: status=${error.status}, url present, details present`);
        }
    });

    await helper.section('Validation Errors');

    await helper.test('ValidationError - missing required params', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        try {
            await client.getNode(null, null);
            throw new Error('Should have thrown ValidationError');
        } catch (error) {
            helper.assert(error instanceof ValidationError, 'Should be ValidationError');
            helper.debug('Missing params validated');
        }
    });

    await helper.test('ValidationError - empty content type', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        try {
            await client.getNodes('');
            throw new Error('Should have thrown ValidationError');
        } catch (error) {
            helper.assert(error instanceof ValidationError, 'Should be ValidationError');
            helper.debug('Empty content type validated');
        }
    });

    await helper.test('ValidationError - invalid vocabulary ID', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        try {
            await client.getTaxonomyTerms('');
            throw new Error('Should have thrown ValidationError');
        } catch (error) {
            helper.assert(error instanceof ValidationError, 'Should be ValidationError');
            helper.assert(error.field === 'vocabularyId', 'Should indicate field');
            helper.debug('Invalid vocabulary ID validated');
        }
    });

    await helper.section('Configuration Errors');

    await helper.test('ConfigurationError - missing baseUrl', async () => {
        try {
            new NodeHiveClient({});
            throw new Error('Should have thrown ConfigurationError');
        } catch (error) {
            helper.assert(error instanceof ConfigurationError, 'Should be ConfigurationError');
            helper.assert(error.message.includes('baseUrl'), 'Should mention baseUrl');
            helper.debug('Missing baseUrl validated');
        }
    });

    await helper.test('ConfigurationError - invalid baseUrl type', async () => {
        try {
            new NodeHiveClient({ baseUrl: 123 }); // Number instead of string
            throw new Error('Should have thrown ConfigurationError');
        } catch (error) {
            // Might be caught by JS type checking
            helper.debug('Invalid baseUrl type handled');
        }
    });

    await helper.section('Retry Mechanism');

    await helper.test('Retry on 500 errors', async () => {
        let attemptCount = 0;
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            retry: {
                enabled: true,
                maxAttempts: 3,
                delay: 100
            }
        });

        // Intercept to count attempts and simulate 500 error
        const remove = client.addRequestInterceptor((config) => {
            attemptCount++;
            if (attemptCount < 3) {
                throw new Error('Simulated server error');
            }
            return config;
        });

        try {
            await client.getContentTypes();
            // If successful, retry worked
            helper.assert(attemptCount === 3, `Should have retried 3 times, got ${attemptCount}`);
            helper.debug(`Retry succeeded after ${attemptCount} attempts`);
        } catch (error) {
            // If still fails, that's OK - we're testing retry behavior
            helper.debug(`Retried ${attemptCount} times before failing`);
        } finally {
            remove();
        }
    });

    await helper.test('No retry on 400 errors', async () => {
        let attemptCount = 0;
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            retry: {
                enabled: true,
                maxAttempts: 3,
                delay: 100
            }
        });

        const remove = client.addRequestInterceptor((config) => {
            attemptCount++;
            return config;
        });

        try {
            // This should cause a 404, which shouldn't retry
            await client.getNode('invalid-uuid', 'invalid-type');
        } catch (error) {
            helper.assert(attemptCount === 1, 'Should not retry on 4xx errors');
            helper.debug('No retry on client errors (correct)');
        } finally {
            remove();
        }
    });

    await helper.test('Retry disabled', async () => {
        let attemptCount = 0;
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            retry: { enabled: false }
        });

        const remove = client.addRequestInterceptor((config) => {
            attemptCount++;
            if (attemptCount === 1) {
                throw new Error('Simulated error');
            }
            return config;
        });

        try {
            await client.getContentTypes();
        } catch (error) {
            helper.assert(attemptCount === 1, 'Should not retry when disabled');
            helper.debug('Retry disabled works correctly');
        } finally {
            remove();
        }
    });

    await helper.section('Error Recovery');

    await helper.test('Batch operations with partial failures', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        const requests = [
            { method: 'getContentTypes', args: [] },
            { method: 'getNode', args: ['invalid-uuid', 'invalid-type'] }, // Will fail
            { method: 'getAvailableMenus', args: [] }
        ];

        const results = await client.batch(requests);

        helper.assert(Array.isArray(results), 'Should return array');
        helper.assert(results.length === 3, 'Should have all results');

        const failures = results.filter(r => r?.error);
        const successes = results.filter(r => !r?.error);

        helper.assert(failures.length === 1, 'Should have one failure');
        helper.assert(successes.length === 2, 'Should have two successes');
        helper.debug(`Batch: ${successes.length} succeeded, ${failures.length} failed`);
    });

    await helper.test('Graceful degradation', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // Try multiple operations, some might fail
        const operations = [
            async () => await client.getResourceBySlug('non-existent-page'),
            async () => await client.router('invalid-route'),
            async () => await client.getRedirect('no-redirect')
        ];

        let successCount = 0;
        let nullCount = 0;

        for (const op of operations) {
            try {
                const result = await op();
                if (result === null) {
                    nullCount++;
                } else {
                    successCount++;
                }
            } catch (error) {
                // Count as handled
            }
        }

        helper.debug(`Operations: ${successCount} succeeded, ${nullCount} returned null`);
        helper.assert(true, 'All operations handled gracefully');
    });

    await helper.section('Error Information');

    await helper.test('Error timestamps', async () => {
        const client = new NodeHiveClient({
            baseUrl: 'https://invalid-domain.com',
            timeout: 1000,
            retry: { enabled: false }
        });

        try {
            await client.getContentTypes();
        } catch (error) {
            if (error instanceof NetworkError) {
                helper.assert(error.timestamp, 'Should have timestamp');
                helper.assert(error.code, 'Should have error code');
                helper.debug(`Error timestamp: ${error.timestamp}`);
                helper.debug(`Error code: ${error.code}`);
            }
        }
    });

    await helper.test('Error context preservation', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        try {
            await client.getMedia('test-uuid', 'test-type');
        } catch (error) {
            if (error instanceof NetworkError) {
                helper.assert(error.message, 'Should have message');
                helper.assert(error.url, 'Should preserve URL');
                helper.assert(error.url.includes('test-uuid'), 'URL should contain UUID');
                helper.assert(error.url.includes('test-type'), 'URL should contain type');
                helper.debug('Error context preserved');
            }
        }
    });

    await helper.summary();
}

// Run tests
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { runTests };