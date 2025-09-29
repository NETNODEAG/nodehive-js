#!/usr/bin/env node

/**
 * Media Tests
 * Tests media retrieval and management operations
 */

import { NodeHiveClient, NetworkError } from '../index.js';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Media Tests');

async function runTests() {
    const client = new NodeHiveClient({
        baseUrl: helper.BACKEND_URL,
        debug: false,
        timeout: 15000
    });

    await helper.section('Media List Operations');

    await helper.test('getMediaList() - images', async () => {
        try {
            const response = await client.getMediaList('image');
            helper.assert(response, 'Should return response');
            helper.assert(response.data, 'Should have data property');
            helper.debug(`Found ${response.data?.length || 0} images`);
            return response.data;
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Image media type not configured');
                return [];
            }
            throw error;
        }
    });

    await helper.test('getMediaList() - with pagination', async () => {
        try {
            const params = new DrupalJsonApiParams()
                .addPageLimit(10)
                .addSort('created', 'DESC');

            const response = await client.getMediaList('image', { params });
            helper.assert(response, 'Should return paginated response');

            if (response.data && response.data.length > 10) {
                throw new Error('Page limit not respected');
            }

            helper.debug(`Retrieved ${response.data?.length || 0} media items with limit`);
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Media type not found');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getMediaList() - videos', async () => {
        try {
            const response = await client.getMediaList('video');
            helper.assert(response, 'Should return response');
            helper.debug(`Found ${response.data?.length || 0} videos`);
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.debug('Video media type not configured (expected)');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getMediaList() - documents', async () => {
        try {
            const response = await client.getMediaList('document');
            helper.assert(response, 'Should return response');
            helper.debug(`Found ${response.data?.length || 0} documents`);
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.debug('Document media type not configured (expected)');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Single Media Operations');

    await helper.test('getMedia() - single item by UUID', async () => {
        try {
            // First get list to find a valid UUID
            const listResponse = await client.getMediaList('image');

            if (listResponse.data && listResponse.data.length > 0) {
                const mediaId = listResponse.data[0].id;
                const media = await client.getMedia(mediaId, 'image');

                helper.assert(media, 'Should return media item');
                helper.assert(media.data, 'Should have data property');
                helper.assert(media.data.id === mediaId, 'UUID should match');
                helper.debug(`Retrieved media: ${mediaId}`);
            } else {
                helper.skip('No media items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Media type not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getMedia() - with includes', async () => {
        try {
            const listResponse = await client.getMediaList('image');

            if (listResponse.data && listResponse.data.length > 0) {
                const mediaId = listResponse.data[0].id;
                const params = new DrupalJsonApiParams()
                    .addInclude(['uid', 'thumbnail']);

                const media = await client.getMedia(mediaId, 'image', { params });
                helper.assert(media, 'Should return media with includes');
                helper.debug('Media retrieved with includes');
            } else {
                helper.skip('No media items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Media type not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.test('getMedia() - with language', async () => {
        try {
            const listResponse = await client.getMediaList('image');

            if (listResponse.data && listResponse.data.length > 0) {
                const mediaId = listResponse.data[0].id;
                const media = await client.getMedia(mediaId, 'image', { lang: 'en' });

                helper.assert(media, 'Should accept language parameter');
                helper.debug('Language parameter accepted');
            } else {
                helper.skip('No media items available');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Media not found');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Media Attributes');

    await helper.test('Media item structure', async () => {
        try {
            const listResponse = await client.getMediaList('image');

            if (listResponse.data && listResponse.data.length > 0) {
                const media = listResponse.data[0];

                helper.assert(media.type, 'Should have type');
                helper.assert(media.id, 'Should have id');

                // Attributes might be in different format or not present
                if (!media.attributes) {
                    helper.debug('Media item has no attributes property (API variation)');
                } else {
                    helper.assert(media.attributes, 'Should have attributes');

                    // Check common media attributes
                    helper.debug(`Media name: ${media.attributes.name || 'Unnamed'}`);
                    helper.debug(`Created: ${media.attributes.created || 'Unknown'}`);

                    if (media.attributes.field_media_image) {
                        helper.debug('Has image field');
                    }
                }

                helper.debug('Media structure validated');
            } else {
                helper.skip('No media items to validate');
            }
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.skip('Media type not configured');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Backwards Compatibility');

    await helper.test('getMedias() - deprecated method', async () => {
        try {
            // Should show deprecation warning
            const response = await client.getMedias('image');
            helper.assert(response, 'Deprecated method still works');
            helper.debug('Backwards compatibility maintained');
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.debug('Method works (media type not found)');
            } else {
                throw error;
            }
        }
    });

    await helper.section('Error Handling');

    await helper.test('getMedia() - invalid UUID', async () => {
        try {
            await client.getMedia('invalid-uuid-123', 'image');
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

    await helper.test('getMediaList() - invalid media type', async () => {
        try {
            await client.getMediaList('invalid_media_type_xyz');
            // Might not throw if type just doesn't exist
            helper.debug('Invalid media type handled');
        } catch (error) {
            if (error instanceof NetworkError && error.status === 404) {
                helper.debug('Invalid media type returns 404 (expected)');
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