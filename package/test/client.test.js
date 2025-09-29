import { NodeHiveClient, NetworkError } from '../index.js';

const BACKEND_URL = 'https://netnode.nodehive.app';

describe('NodeHiveClient Integration Tests', () => {
    let client;

    beforeAll(() => {
        // Initialize client with the real backend
        client = new NodeHiveClient({
            baseUrl: BACKEND_URL,
            debug: false,
            timeout: 10000,
            retry: {
                enabled: true,
                maxAttempts: 2,
                delay: 500
            }
        });
    });

    describe('getContentTypes', () => {
        test('should fetch content types from the backend', async () => {
            const response = await client.getContentTypes();

            // Check response structure
            expect(response).toBeDefined();
            expect(response).toHaveProperty('data');
            expect(Array.isArray(response.data)).toBe(true);

            if (response.data.length > 0) {
                // Check first content type structure
                const firstType = response.data[0];
                expect(firstType).toHaveProperty('type');
                expect(firstType).toHaveProperty('id');
                expect(firstType).toHaveProperty('attributes');

                // Check attributes
                expect(firstType.attributes).toHaveProperty('name');
                expect(firstType.attributes).toHaveProperty('description');
            }

            console.log(`Found ${response.data.length} content types`);
            response.data.forEach(type => {
                console.log(`  - ${type.attributes.name} (${type.id})`);
            });
        });

        test('should handle errors gracefully', async () => {
            // Create a client with invalid URL to test error handling
            const badClient = new NodeHiveClient({
                baseUrl: 'https://invalid-url-that-does-not-exist.com',
                timeout: 3000,
                retry: {
                    enabled: false
                }
            });

            await expect(badClient.getContentTypes()).rejects.toThrow(NetworkError);
        });
    });

    describe('getNodes', () => {
        test('should fetch nodes of a specific content type', async () => {
            // First, get available content types
            const typesResponse = await client.getContentTypes();

            if (typesResponse.data && typesResponse.data.length > 0) {
                // Use the first available content type for testing
                const contentType = typesResponse.data[0].attributes.drupal_internal__type;
                console.log(`Testing getNodes with content type: ${contentType}`);

                const nodesResponse = await client.getNodes(contentType);

                expect(nodesResponse).toBeDefined();
                expect(nodesResponse).toHaveProperty('data');
                expect(Array.isArray(nodesResponse.data)).toBe(true);

                console.log(`Found ${nodesResponse.data.length} nodes of type ${contentType}`);

                if (nodesResponse.data.length > 0) {
                    const firstNode = nodesResponse.data[0];
                    expect(firstNode).toHaveProperty('type');
                    expect(firstNode).toHaveProperty('id');
                    expect(firstNode).toHaveProperty('attributes');
                }
            } else {
                console.warn('No content types available for testing getNodes');
            }
        });

        test('should support language parameter', async () => {
            // Test with a language parameter
            const typesResponse = await client.getContentTypes();

            if (typesResponse.data && typesResponse.data.length > 0) {
                const contentType = typesResponse.data[0].attributes.drupal_internal__type;

                // Test with English language
                const nodesResponse = await client.getNodes(contentType, { lang: 'en' });

                expect(nodesResponse).toBeDefined();
                expect(nodesResponse).toHaveProperty('data');
            }
        });
    });

    describe('Request Options', () => {
        test('should respect timeout setting', async () => {
            const timeoutClient = new NodeHiveClient({
                baseUrl: BACKEND_URL,
                timeout: 1, // 1ms timeout - should fail
                retry: { enabled: false }
            });

            await expect(timeoutClient.getContentTypes()).rejects.toThrow(NetworkError);
        });

        test('should support request interceptors', async () => {
            const interceptedClient = new NodeHiveClient({
                baseUrl: BACKEND_URL
            });

            let requestIntercepted = false;
            let responseIntercepted = false;

            // Add request interceptor
            const removeRequestInterceptor = interceptedClient.addRequestInterceptor((config) => {
                requestIntercepted = true;
                config.headers['X-Test-Header'] = 'test-value';
                return config;
            });

            // Add response interceptor
            const removeResponseInterceptor = interceptedClient.addResponseInterceptor((data) => {
                responseIntercepted = true;
                return data;
            });

            await interceptedClient.getContentTypes();

            expect(requestIntercepted).toBe(true);
            expect(responseIntercepted).toBe(true);

            // Clean up interceptors
            removeRequestInterceptor();
            removeResponseInterceptor();
        });
    });
});

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    console.log('Running NodeHiveClient integration tests...');
    console.log('Backend URL:', BACKEND_URL);
    console.log('');

    const runTests = async () => {
        const client = new NodeHiveClient({
            baseUrl: BACKEND_URL,
            debug: false,
            timeout: 10000
        });

        try {
            console.log('Testing getContentTypes...');
            const response = await client.getContentTypes();
            console.log('✅ getContentTypes successful');
            console.log(`   Found ${response.data.length} content types`);

            if (response.data.length > 0) {
                console.log('\nTesting getNodes...');
                const contentType = response.data[0].attributes.drupal_internal__type;
                const nodesResponse = await client.getNodes(contentType);
                console.log('✅ getNodes successful');
                console.log(`   Found ${nodesResponse.data.length} nodes of type ${contentType}`);
            }

            console.log('\n✅ All tests passed!');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            if (error instanceof NetworkError) {
                console.error('   Status:', error.status);
                console.error('   URL:', error.url);
            }
            process.exit(1);
        }
    };

    runTests();
}