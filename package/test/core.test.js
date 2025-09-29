#!/usr/bin/env node

/**
 * Core API Tests
 * Tests basic content retrieval methods
 */

import { NodeHiveClient, ValidationError } from '../index.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Core API Tests');

async function runTests() {
    const client = new NodeHiveClient({
        baseUrl: helper.BACKEND_URL,
        debug: false,
        timeout: 15000
    });

    // Content Types
    await helper.section('Content Types');

    await helper.test('getContentTypes()', async () => {
        const response = await client.getContentTypes();
        helper.assert(response?.data, 'Should return data');
        helper.assert(Array.isArray(response.data), 'Data should be an array');
        helper.debug(`Found ${response.data.length} content types`);
        return response.data;
    });

    // Nodes
    await helper.section('Node Operations');

    const contentTypes = await client.getContentTypes();
    const testType = contentTypes.data?.[0]?.attributes?.drupal_internal__type;

    if (testType) {
        await helper.test('getNodes() - basic', async () => {
            const response = await client.getNodes(testType);
            helper.assert(response, 'Should return response');
            helper.debug(`Found ${response.data?.length || 0} nodes of type ${testType}`);
        });

        await helper.test('getNodes() - with params', async () => {
            const params = new DrupalJsonApiParams()
                .addPageLimit(5)
                .addSort('created', 'DESC');

            const response = await client.getNodes(testType, { params });
            helper.assert(response, 'Should return response');
            if (response.data?.length > 5) {
                throw new Error('Page limit not respected');
            }
            helper.debug(`Retrieved ${response.data?.length || 0} nodes with limit`);
        });

        await helper.test('getNodes() - with language', async () => {
            const response = await client.getNodes(testType, { lang: 'en' });
            helper.assert(response, 'Should return response');
            helper.debug('Language parameter accepted');
        });

        await helper.test('getNode() - single node by UUID', async () => {
            const listResponse = await client.getNodes(testType);
            if (listResponse.data?.length > 0) {
                const uuid = listResponse.data[0].id;
                const node = await client.getNode(uuid, testType);
                helper.assert(node?.data, 'Should return node data');
                helper.assert(node.data.id === uuid, 'UUID should match');
                helper.debug(`Retrieved node: ${uuid}`);
            } else {
                helper.skip('No nodes available to test');
            }
        });

        await helper.test('getNode() - with includes', async () => {
            const listResponse = await client.getNodes(testType);
            if (listResponse.data?.length > 0) {
                const uuid = listResponse.data[0].id;
                const params = new DrupalJsonApiParams();

                const node = await client.getNode(uuid, testType, { params });
                helper.assert(node, 'Should return node with includes');
                helper.debug('Node retrieved with includes');
            } else {
                helper.skip('No nodes available');
            }
        });

        await helper.test('getNode() - validation error', async () => {
            try {
                await client.getNode(null, null);
                throw new Error('Should have thrown ValidationError');
            } catch (error) {
                helper.assert(error instanceof ValidationError, 'Should throw ValidationError');
                helper.debug('Validation error thrown correctly');
            }
        });
    } else {
        helper.skip('Node tests', 'No content types available');
    }

    // Resource by slug
    await helper.section('Resource Operations');

    await helper.test('getResourceBySlug() - existing page', async () => {
        const result = await client.getResourceBySlug('home');
        // May be null if page doesn't exist
        helper.debug(`Result: ${result ? 'Found' : 'Not found'}`);
    });

    await helper.test('getResourceBySlug() - with language', async () => {
        const result = await client.getResourceBySlug('about', { lang: 'en' });
        helper.debug(`Result: ${result ? 'Found' : 'Not found'}`);
    });

    await helper.test('getResourceBySlug() - non-existent page', async () => {
        const result = await client.getResourceBySlug('definitely-does-not-exist-xyz-123');
        helper.assert(result === null, 'Should return null for non-existent page');
        helper.debug('Correctly returned null');
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