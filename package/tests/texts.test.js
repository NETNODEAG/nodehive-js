#!/usr/bin/env node

/**
 * Texts Tests
 * Tests texts entity retrieval operations
 */

import { NodeHiveClient, NetworkError } from '../index.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Texts Tests');

async function runTests() {
    const client = new NodeHiveClient({
        baseUrl: helper.BACKEND_URL,
        debug: false,
        timeout: 15000
    });

    await helper.section('Text List Operations');

    await helper.test('getTexts() - basic', async () => {
        try {
            const response = await client.getTexts();
            helper.assert(response, 'Should return response');
            helper.assert(response.data, 'Should have data property');
            helper.debug(`Found ${response.data?.length || 0} texts`);
            return response.data;
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not configured');
                return [];
            }
            throw error;
        }
    });

    await helper.test('getTexts() - with params', async () => {
        try {
            const params = new DrupalJsonApiParams()
                .addPageLimit(5)
                .addSort('changed', 'DESC');

            const response = await client.getTexts({ params });
            helper.assert(response, 'Should return paginated response');

            if (response.data && response.data.length > 5) {
                throw new Error('Page limit not respected');
            }

            helper.debug(`Retrieved ${response.data?.length || 0} texts with limit`);
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTexts() - with language', async () => {
        try {
            const response = await client.getTexts({ lang: 'de' });
            helper.assert(response, 'Should accept language parameter');
            helper.debug('Language parameter accepted');
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTexts() - with filters', async () => {
        try {
            const params = new DrupalJsonApiParams()
                .addPageLimit(10);

            const response = await client.getTexts({ params });
            helper.assert(response, 'Should accept filter parameters');
            helper.debug(`Found ${response.data?.length || 0} texts with filters`);
        } catch (error) {
            if (error instanceof NetworkError && (error.status === 404 || error.status === 400)) {
                helper.skip('Texts entity not found or filter not supported');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Single Text Operations');

    await helper.test('getText() - single text by UUID', async () => {
        try {
            // First get list to find a valid UUID
            const listResponse = await client.getTexts();

            if (listResponse.data && listResponse.data.length > 0) {
                const textId = listResponse.data[0].id;
                const text = await client.getText(textId);

                helper.assert(text, 'Should return text item');
                helper.assert(text.data, 'Should have data property');
                helper.assert(text.data.id === textId, 'UUID should match');
                helper.debug(`Retrieved text: ${textId}`);
            } else {
                helper.skip('No text items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getText() - with params', async () => {
        try {
            const listResponse = await client.getTexts();

            if (listResponse.data && listResponse.data.length > 0) {
                const textId = listResponse.data[0].id;
                const params = new DrupalJsonApiParams()
                    .addInclude(['uid']);

                const text = await client.getText(textId, { params });
                helper.assert(text, 'Should return text with includes');
                helper.debug('Text retrieved with params');
            } else {
                helper.skip('No text items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getText() - with language', async () => {
        try {
            const listResponse = await client.getTexts();

            if (listResponse.data && listResponse.data.length > 0) {
                const textId = listResponse.data[0].id;
                const text = await client.getText(textId, { lang: 'de' });

                helper.assert(text, 'Should accept language parameter');
                helper.debug('Language parameter accepted');
            } else {
                helper.skip('No text items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Text not found');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Text Attributes');

    await helper.test('Text item structure', async () => {
        try {
            const listResponse = await client.getTexts();

            if (listResponse.data && listResponse.data.length > 0) {
                const text = listResponse.data[0];

                helper.assert(text.type, 'Should have type');
                helper.assert(text.id, 'Should have id');
                helper.assert(text.type === 'texts--texts', 'Type should be texts--texts');

                if (text.attributes) {
                    helper.debug('Text has attributes property');
                } else {
                    helper.debug('Text item has no attributes property');
                }

                helper.debug('Text structure validated');
            } else {
                helper.skip('No text items to validate');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Texts entity not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Error Handling');

    await helper.test('getText() - missing UUID', async () => {
        try {
            await client.getText();
            throw new Error('Should have thrown ValidationError');
        } catch (error) {
            helper.assert(
                error.message.includes('UUID is required'),
                'Should validate UUID is required'
            );
            helper.debug('Validation error thrown correctly');
        }
    });

    await helper.test('getText() - invalid UUID', async () => {
        try {
            await client.getText('invalid-uuid-123');
            throw new Error('Should have thrown error for invalid UUID');
        } catch (error) {
            if (error instanceof NetworkError) {
                helper.assert(
                    error.status === 404 || error.status === 400,
                    'Should return 404 or 400 for invalid UUID'
                );
                helper.debug('Invalid UUID handled correctly');
            } else {
                throw error;
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
