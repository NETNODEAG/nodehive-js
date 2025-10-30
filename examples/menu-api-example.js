/**
 * Menu API Example - NodeHive Menu API v1
 *
 * This example demonstrates how to use the new getMenu() method
 * to fetch menu data from the NodeHive Menu API v1 endpoint.
 *
 * The Menu API v1 provides a simplified menu structure that is
 * easier to work with than the standard JSON:API menu endpoints.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize client
const client = new NodeHiveClient({
    baseUrl: process.env.NODEHIVE_BASE_URL || 'https://netnode.nodehive.app',
    debug: true,
    defaultLanguage: 'de'
});

/**
 * Example 1: Fetch a menu by ID
 */
async function fetchMenuById() {
    console.log('\n=== Example 1: Fetch Menu by ID ===\n');

    try {
        // Fetch the menu with ID '20jahre-main'
        const menu = await client.getMenu('20jahre-main');

        console.log('Menu ID:', menu.menu_id);
        console.log('Language:', menu.language);
        console.log('Number of menu items:', menu.data.length);
        console.log('\nMenu Items:');

        menu.data.forEach((item, index) => {
            console.log(`\n${index + 1}. ${item.title}`);
            console.log(`   URL: ${item.url}`);
            console.log(`   Enabled: ${item.enabled}`);
            console.log(`   Expanded: ${item.expanded}`);
            console.log(`   Weight: ${item.weight}`);
            if (item.description) {
                console.log(`   Description: ${item.description}`);
            }
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
    }
}

/**
 * Example 2: Fetch menu with language override
 */
async function fetchMenuWithLanguage() {
    console.log('\n=== Example 2: Fetch Menu with Language Override ===\n');

    try {
        // Fetch menu in English instead of default German
        const menu = await client.getMenu('20jahre-main', { lang: 'en' });

        console.log('Menu fetched in language:', menu.language);
        console.log('First item:', menu.data[0]?.title);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
    }
}

/**
 * Example 3: Filter enabled menu items
 */
async function fetchEnabledMenuItems() {
    console.log('\n=== Example 3: Filter Enabled Menu Items ===\n');

    try {
        const menu = await client.getMenu('20jahre-main');

        // Filter only enabled items
        const enabledItems = menu.data.filter(item => item.enabled);

        console.log('Total items:', menu.data.length);
        console.log('Enabled items:', enabledItems.length);
        console.log('\nEnabled items:');

        enabledItems.forEach(item => {
            console.log(`- ${item.title} (${item.url})`);
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
    }
}

/**
 * Example 4: Sort menu items by weight
 */
async function fetchSortedMenuItems() {
    console.log('\n=== Example 4: Sort Menu Items by Weight ===\n');

    try {
        const menu = await client.getMenu('20jahre-main');

        // Sort items by weight (ascending)
        const sortedItems = [...menu.data].sort((a, b) => {
            return parseInt(a.weight) - parseInt(b.weight);
        });

        console.log('Menu items sorted by weight:');
        sortedItems.forEach(item => {
            console.log(`${item.weight.padStart(3)} - ${item.title}`);
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
    }
}

/**
 * Example 5: Build navigation structure
 */
async function buildNavigationStructure() {
    console.log('\n=== Example 5: Build Navigation Structure ===\n');

    try {
        const menu = await client.getMenu('20jahre-main');

        // Build a simple navigation structure
        const navigation = menu.data
            .filter(item => item.enabled)
            .sort((a, b) => parseInt(a.weight) - parseInt(b.weight))
            .map(item => ({
                label: item.title,
                href: item.url,
                description: item.description
            }));

        console.log('Navigation structure:');
        console.log(JSON.stringify(navigation, null, 2));
    } catch (error) {
        console.error('Error building navigation:', error.message);
    }
}

/**
 * Example 6: Compare Menu API v1 vs JSON:API
 */
async function compareMenuApis() {
    console.log('\n=== Example 6: Compare Menu API v1 vs JSON:API ===\n');

    try {
        // Fetch using Menu API v1
        console.log('Fetching with Menu API v1...');
        const startV1 = Date.now();
        const menuV1 = await client.getMenu('20jahre-main');
        const timeV1 = Date.now() - startV1;

        console.log(`✓ Menu API v1: ${timeV1}ms`);
        console.log(`  Structure: Simple object with menu_id, language, and data array`);
        console.log(`  Items: ${menuV1.data.length}`);
        console.log(`  Response size: ~${JSON.stringify(menuV1).length} bytes`);

        // Try to fetch using JSON:API (getMenuLinks)
        console.log('\nFetching with JSON:API...');
        try {
            const startJsonApi = Date.now();
            const menuJsonApi = await client.getMenuLinks('20jahre-main');
            const timeJsonApi = Date.now() - startJsonApi;

            console.log(`✓ JSON:API: ${timeJsonApi}ms`);
            console.log(`  Structure: Complex JSON:API format with data, included, links, meta`);
            console.log(`  Items: ${menuJsonApi.data?.length || 0}`);
            console.log(`  Response size: ~${JSON.stringify(menuJsonApi).length} bytes`);

            console.log(`\nSpeed difference: ${Math.abs(timeV1 - timeJsonApi)}ms`);
        } catch (jsonApiError) {
            console.log(`✗ JSON:API requires authentication`);
            console.log(`\nAdvantage: Menu API v1 works without authentication!`);
        }
    } catch (error) {
        console.error('Error comparing APIs:', error.message);
    }
}

// Run all examples
async function main() {
    console.log('NodeHive Menu API v1 Examples');
    console.log('=============================');

    await fetchMenuById();
    await fetchMenuWithLanguage();
    await fetchEnabledMenuItems();
    await fetchSortedMenuItems();
    await buildNavigationStructure();
    await compareMenuApis();

    console.log('\n✓ All examples completed!');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export {
    fetchMenuById,
    fetchMenuWithLanguage,
    fetchEnabledMenuItems,
    fetchSortedMenuItems,
    buildNavigationStructure,
    compareMenuApis
};
