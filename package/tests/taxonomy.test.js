#!/usr/bin/env node

/**
 * Taxonomy Tests
 * Tests taxonomy term and vocabulary operations
 */

import { NodeHiveClient } from '../index.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Taxonomy Tests');

async function runTests() {
    const client = new NodeHiveClient({
        baseUrl: helper.BACKEND_URL,
        debug: false,
        timeout: 15000
    });

    await helper.section('Taxonomy Terms');

    await helper.test('getTaxonomyTerms() - tags vocabulary', async () => {
        try {
            const response = await client.getTaxonomyTerms('tags');
            helper.assert(response, 'Should return response');
            helper.debug(`Found ${response.length || 0} tags`);
        } catch (error) {
            // Vocabulary might not exist
            if (error.status === 404) {
                helper.skip('tags vocabulary not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTaxonomyTerms() - with params', async () => {
        try {
            const params = new DrupalJsonApiParams()
                .addPageLimit(5)
                .addSort('name', 'ASC');

            const response = await client.getTaxonomyTerms('tags', { params });
            helper.assert(response, 'Should return response with params');
            helper.debug('Params accepted for taxonomy terms');
        } catch (error) {
            if (error.status === 404) {
                helper.skip('vocabulary not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTaxonomyTerms() - categories vocabulary', async () => {
        try {
            const response = await client.getTaxonomyTerms('categories');
            helper.assert(response, 'Should return response');
            helper.debug(`Found ${response.length || 0} categories`);
        } catch (error) {
            if (error.status === 404) {
                // Try another common vocabulary
                try {
                    const response = await client.getTaxonomyTerms('topics');
                    helper.debug(`Found ${response.length || 0} topics`);
                } catch (e) {
                    helper.skip('No standard vocabularies found');
                }
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTaxonomyTerm() - single term', async () => {
        try {
            // First get terms to find a valid ID
            const terms = await client.getTaxonomyTerms('tags');
            if (terms && terms.length > 0) {
                const termId = terms[0].id;
                const term = await client.getTaxonomyTerm(termId, 'tags');
                helper.assert(term, 'Should return single term');
                helper.assert(term.data?.id === termId, 'Term ID should match');
                helper.debug(`Retrieved term: ${termId}`);
            } else {
                helper.skip('No terms available to test');
            }
        } catch (error) {
            if (error.status === 404) {
                helper.skip('vocabulary not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTaxonomyTerm() - with includes', async () => {
        try {
            const terms = await client.getTaxonomyTerms('tags');
            if (terms && terms.length > 0) {
                const termId = terms[0].id;
                const params = new DrupalJsonApiParams()
                    .addInclude(['parent', 'vid']);

                const term = await client.getTaxonomyTerm(termId, 'tags', { params });
                helper.assert(term, 'Should return term with includes');
                helper.debug('Term retrieved with includes');
            } else {
                helper.skip('No terms available');
            }
        } catch (error) {
            if (error.status === 404) {
                helper.skip('vocabulary not found');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Backwards Compatibility');

    await helper.test('getTaxonomies() - deprecated method', async () => {
        try {
            // Should show deprecation warning
            const response = await client.getTaxonomies('tags');
            helper.assert(response, 'Deprecated method still works');
            helper.debug('Backwards compatibility maintained');
        } catch (error) {
            if (error.status === 404) {
                helper.debug('Method works (vocabulary not found)');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Vocabulary Operations');

    await helper.test('Multiple vocabulary queries', async () => {
        const vocabularies = ['tags', 'categories', 'topics', 'types'];
        let foundAny = false;

        for (const vocab of vocabularies) {
            try {
                const response = await client.getTaxonomyTerms(vocab);
                if (response) {
                    foundAny = true;
                    helper.debug(`Vocabulary '${vocab}' has ${response.length || 0} terms`);
                }
            } catch (error) {
                if (error.status !== 404) {
                    throw error;
                }
            }
        }

        if (!foundAny) {
            helper.skip('No standard vocabularies found on this site');
        } else {
            helper.debug('Vocabulary queries completed');
        }
    });

    await helper.test('getTaxonomyTerms() - with language', async () => {
        try {
            const response = await client.getTaxonomyTerms('tags', { lang: 'en' });
            helper.assert(response, 'Should accept language parameter');
            helper.debug('Language parameter accepted');
        } catch (error) {
            if (error.status === 404) {
                helper.skip('vocabulary not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getTaxonomyTerms() - pagination', async () => {
        try {
            const params1 = new DrupalJsonApiParams().addPageLimit(2).addPageOffset(0);
            const params2 = new DrupalJsonApiParams().addPageLimit(2).addPageOffset(2);

            const page1 = await client.getTaxonomyTerms('tags', { params: params1 });
            const page2 = await client.getTaxonomyTerms('tags', { params: params2 });

            // If we have terms, check pagination
            if (page1 && page1.length > 0) {
                helper.debug(`Page 1: ${page1.length} terms`);
                helper.debug(`Page 2: ${page2?.length || 0} terms`);

                // Check that pages are different if both have content
                if (page1.length > 0 && page2?.length > 0) {
                    helper.assert(
                        page1[0].id !== page2[0].id,
                        'Different pages should have different terms'
                    );
                }
            } else {
                helper.skip('Not enough terms for pagination test');
            }
        } catch (error) {
            if (error.status === 404) {
                helper.skip('vocabulary not found');
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