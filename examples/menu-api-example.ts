/**
 * TypeScript Menu API Example - NodeHive Menu API v1
 *
 * This example demonstrates how to use the new getMenu() method
 * with TypeScript for type-safe menu data access.
 */

import { NodeHiveClient, MenuApiResponse } from '../package/index.js';
import type { RequestOptions } from '../package/types.js';

// Initialize client with type-safe configuration
const client = new NodeHiveClient({
    baseUrl: process.env.NODEHIVE_BASE_URL || 'https://netnode.nodehive.app',
    debug: true,
    defaultLanguage: 'de'
});

/**
 * Type-safe menu item interface
 */
interface MenuItem {
    title: string;
    url: string;
    description: string | null;
    enabled: boolean;
    expanded: boolean;
    weight: string;
}

/**
 * Navigation item for frontend use
 */
interface NavigationItem {
    label: string;
    href: string;
    description?: string;
}

/**
 * Example 1: Fetch menu with full type safety
 */
async function fetchTypeSafeMenu(): Promise<void> {
    console.log('\n=== TypeScript Example 1: Type-Safe Menu Fetching ===\n');

    try {
        // Type-safe menu fetching
        const menu: MenuApiResponse = await client.getMenu('20jahre-main');

        // TypeScript knows the exact structure
        console.log('Menu ID:', menu.menu_id); // string
        console.log('Language:', menu.language); // string
        console.log('Number of items:', menu.data.length); // number

        // Type-safe iteration
        menu.data.forEach((item: MenuItem) => {
            console.log(`- ${item.title}: ${item.url}`);
            // TypeScript provides autocomplete for all properties
        });
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
    }
}

/**
 * Example 2: Type-safe menu filtering and transformation
 */
async function transformMenuToNavigation(): Promise<NavigationItem[]> {
    console.log('\n=== TypeScript Example 2: Transform Menu to Navigation ===\n');

    try {
        const menu: MenuApiResponse = await client.getMenu('20jahre-main');

        // Type-safe transformation with filter and map
        const navigation: NavigationItem[] = menu.data
            .filter((item): item is MenuItem => item.enabled)
            .sort((a, b) => parseInt(a.weight) - parseInt(b.weight))
            .map((item): NavigationItem => ({
                label: item.title,
                href: item.url,
                ...(item.description && { description: item.description })
            }));

        console.log('Navigation items:', navigation.length);
        console.log(JSON.stringify(navigation, null, 2));

        return navigation;
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        return [];
    }
}

/**
 * Example 3: Generic menu fetcher with options
 */
async function fetchMenuWithOptions<T = MenuApiResponse>(
    menuId: string,
    options?: RequestOptions
): Promise<T | null> {
    console.log(`\n=== TypeScript Example 3: Fetch ${menuId} ===\n`);

    try {
        const menu = await client.getMenu(menuId, options) as T;
        console.log('✓ Menu fetched successfully');
        return menu;
    } catch (error) {
        console.error('✗ Error fetching menu:', error instanceof Error ? error.message : error);
        return null;
    }
}

/**
 * Example 4: Menu processing class with type safety
 */
class MenuProcessor {
    private menu: MenuApiResponse;

    constructor(menu: MenuApiResponse) {
        this.menu = menu;
    }

    /**
     * Get only enabled items
     */
    getEnabledItems(): MenuItem[] {
        return this.menu.data.filter(item => item.enabled);
    }

    /**
     * Get items sorted by weight
     */
    getSortedItems(): MenuItem[] {
        return [...this.menu.data].sort((a, b) =>
            parseInt(a.weight) - parseInt(b.weight)
        );
    }

    /**
     * Find item by title
     */
    findByTitle(title: string): MenuItem | undefined {
        return this.menu.data.find(item =>
            item.title.toLowerCase() === title.toLowerCase()
        );
    }

    /**
     * Get menu statistics
     */
    getStats(): {
        total: number;
        enabled: number;
        disabled: number;
        withDescription: number;
    } {
        return {
            total: this.menu.data.length,
            enabled: this.menu.data.filter(item => item.enabled).length,
            disabled: this.menu.data.filter(item => !item.enabled).length,
            withDescription: this.menu.data.filter(item => item.description !== null).length
        };
    }

    /**
     * Convert to navigation structure
     */
    toNavigation(): NavigationItem[] {
        return this.getEnabledItems()
            .sort((a, b) => parseInt(a.weight) - parseInt(b.weight))
            .map(item => ({
                label: item.title,
                href: item.url,
                ...(item.description && { description: item.description })
            }));
    }
}

/**
 * Example 5: Using the MenuProcessor class
 */
async function useMenuProcessor(): Promise<void> {
    console.log('\n=== TypeScript Example 4: Menu Processor ===\n');

    try {
        const menu: MenuApiResponse = await client.getMenu('20jahre-main');
        const processor = new MenuProcessor(menu);

        // Get statistics
        const stats = processor.getStats();
        console.log('Menu Statistics:');
        console.log(`  Total items: ${stats.total}`);
        console.log(`  Enabled: ${stats.enabled}`);
        console.log(`  Disabled: ${stats.disabled}`);
        console.log(`  With description: ${stats.withDescription}`);

        // Find specific item
        const homeItem = processor.findByTitle('Home');
        if (homeItem) {
            console.log(`\nFound item: ${homeItem.title} -> ${homeItem.url}`);
        }

        // Get sorted items
        const sortedItems = processor.getSortedItems();
        console.log('\nItems by weight:');
        sortedItems.forEach(item => {
            console.log(`  ${item.weight}: ${item.title}`);
        });

        // Convert to navigation
        const navigation = processor.toNavigation();
        console.log(`\nNavigation items: ${navigation.length}`);
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
    }
}

/**
 * Example 6: React/Next.js integration example
 */
async function fetchMenuForReact(): Promise<NavigationItem[]> {
    console.log('\n=== TypeScript Example 5: React/Next.js Integration ===\n');

    try {
        // This could be used in getStaticProps or getServerSideProps
        const menu: MenuApiResponse = await client.getMenu('20jahre-main', {
            lang: 'de'
        });

        // Transform for React component props
        const navigationItems: NavigationItem[] = menu.data
            .filter(item => item.enabled)
            .sort((a, b) => parseInt(a.weight) - parseInt(b.weight))
            .map(item => ({
                label: item.title,
                href: item.url,
                description: item.description || undefined
            }));

        console.log('Navigation ready for React:');
        console.log(`  Items: ${navigationItems.length}`);
        console.log('  Structure:', navigationItems[0]);

        return navigationItems;
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        return [];
    }
}

/**
 * Run all TypeScript examples
 */
async function main(): Promise<void> {
    console.log('NodeHive Menu API v1 - TypeScript Examples');
    console.log('==========================================');

    await fetchTypeSafeMenu();
    await transformMenuToNavigation();
    await fetchMenuWithOptions('20jahre-main', { lang: 'de' });
    await useMenuProcessor();
    await fetchMenuForReact();

    console.log('\n✓ All TypeScript examples completed!');
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export {
    fetchTypeSafeMenu,
    transformMenuToNavigation,
    fetchMenuWithOptions,
    MenuProcessor,
    useMenuProcessor,
    fetchMenuForReact
};
