/**
 * TypeScript Authentication Example
 *
 * Demonstrates type-safe authentication with NodeHive API Key
 *
 * Setup:
 * 1. Ensure NODEHIVE_API_KEY is set in .env
 * 2. Run: npx tsx typescript-auth.ts
 */

import { NodeHiveClient } from '../package/index.js';
import type { AuthOptions, LoginResult, ApiResponse } from '../package/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('═══════════════════════════════════════');
console.log('   TypeScript Authentication Example');
console.log('   Type-Safe NodeHive API Key Auth');
console.log('═══════════════════════════════════════\n');

// ============================================================
// Example 1: Type-Safe API Key Authentication
// ============================================================
console.log('--- Example 1: Type-Safe API Key Setup ---\n');

// Define authentication configuration with type safety
const auth: AuthOptions = {
    apiKey: process.env.NODEHIVE_API_KEY
};

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://demo.nodehive.app',
    auth
});

async function demonstrateTypeSafety(): Promise<void> {
    try {
        console.log('✓ Client configured with type-safe auth');
        console.log('  API Key:', process.env.NODEHIVE_API_KEY?.substring(0, 20) + '...\n');

        // Type-safe authentication check
        const isLoggedIn: boolean = await client.isLoggedIn();
        console.log('✓ Authenticated:', isLoggedIn, '\n');

        // ============================================================
        // Example 2: Type-Safe API Responses
        // ============================================================
        console.log('--- Example 2: Type-Safe API Responses ---\n');

        // Generic ApiResponse type
        const contentTypes: ApiResponse = await client.getContentTypes();
        console.log('✓ Content Types:', contentTypes.data?.length || 0);

        // Access response properties with type safety
        if (contentTypes.data) {
            console.log('  First type:', contentTypes.data[0]?.attributes?.drupal_internal__type);
        }

        // Fetch nodes with type safety
        const articles: ApiResponse = await client.getNodes('article', {
            params: { 'page[limit]': 3 }
        });
        console.log('\n✓ Articles:', articles.data?.length || 0);

        // Access included resources
        if (articles.included) {
            console.log('  Included resources:', articles.included.length);
        }

        // Access links
        if (articles.links?.next) {
            console.log('  Next page available:', !!articles.links.next);
        }

        // ============================================================
        // Example 3: Custom Type Definitions
        // ============================================================
        console.log('\n--- Example 3: Custom Type Definitions ---\n');

        // Define your own types for content
        interface Article {
            id: string;
            type: string;
            attributes: {
                title?: string;
                created?: string;
                status?: boolean;
            };
        }

        // Use custom type with ApiResponse
        const typedArticles: ApiResponse<Article[]> = await client.getNodes('article', {
            params: { 'page[limit]': 2 }
        });

        if (typedArticles.data) {
            console.log('✓ Type-safe article access:');
            typedArticles.data.forEach((article: Article, index: number) => {
                const title = article.attributes?.title || 'Untitled';
                console.log(`  Article ${index + 1}:`, title);
            });
        }

        // ============================================================
        // Example 4: Error Handling with Types
        // ============================================================
        console.log('\n--- Example 4: Type-Safe Error Handling ---\n');

        try {
            const result: ApiResponse = await client.getNodes('nonexistent_type');
            console.log('Result:', result.data?.length);
        } catch (error) {
            // Type-safe error handling
            if (error && typeof error === 'object' && 'status' in error) {
                console.log('✓ Caught error with status:', (error as any).status);
            } else {
                console.log('✓ Caught error:', error instanceof Error ? error.message : String(error));
            }
        }

        // ============================================================
        // Example 5: Type Inference
        // ============================================================
        console.log('\n--- Example 5: Type Inference ---\n');

        // TypeScript infers types automatically
        const menus = await client.getMenus();  // Type: Promise<ApiResponse>
        const media = await client.getMediaList('image', {
            params: { 'page[limit]': 1 }
        });

        console.log('✓ Type inference works automatically');
        console.log('  Menus:', menus.data?.length || 0);
        console.log('  Media:', media.data?.length || 0);

        // ============================================================
        // Example 6: Optional Configuration
        // ============================================================
        console.log('\n--- Example 6: Optional Configuration Types ---\n');

        try {
            // All options are type-checked
            const configuredResponse = await client.getNodes('article', {
                params: {
                    'page[limit]': 1,
                    'sort': '-created'
                },
                headers: {
                    'X-Custom-Header': 'value'
                }
            });

            console.log('✓ Configured request executed');
            console.log('  Response has data:', !!configuredResponse.data);
        } catch (err) {
            console.log('✓ Type-safe configuration (request failed but types work)');
        }

        console.log('\n═══════════════════════════════════════');
        console.log('   ✨ TypeScript examples completed!');
        console.log('═══════════════════════════════════════');
        console.log('\n💡 Key Takeaway:');
        console.log('   TypeScript provides full type safety and IntelliSense!');
        console.log('   Catch errors at compile-time, not runtime.\n');

    } catch (error) {
        console.error('✗ Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// ============================================================
// OAuth Example with Types
// ============================================================
async function oauthExample(): Promise<void> {
    console.log('\n--- OAuth Example with Types ---\n');

    // Skip if OAuth not configured
    if (!process.env.OAUTH_CLIENT_ID || !process.env.OAUTH_USERNAME) {
        console.log('ℹ️  OAuth example skipped (credentials not configured)\n');
        return;
    }

    // Type-safe OAuth configuration
    const oauthAuth: AuthOptions = {
        method: 'oauth',
        oauth: {
            grantType: 'password',
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        }
    };

    const oauthClient = new NodeHiveClient({
        baseUrl: process.env.DRUPAL_BASE_URL || 'https://demo.nodehive.app',
        auth: oauthAuth
    });

    try {
        // Type-safe login with full result typing
        const result: LoginResult = await oauthClient.login(
            process.env.OAUTH_USERNAME || '',
            process.env.OAUTH_PASSWORD || ''
        );

        console.log('✓ OAuth Login Result:');
        console.log('  Success:', result.success);
        console.log('  Method:', result.method);
        console.log('  Token type:', result.token_type);
        console.log('  Expires in:', result.expires_in, 'seconds');
        console.log('  Has refresh token:', !!result.refresh_token);
        console.log('  User:', result.user ? '✓' : '✗');
    } catch (error) {
        console.log('✗ OAuth login failed:', error instanceof Error ? error.message : String(error));
    }
}

// ============================================================
// Main Execution
// ============================================================
async function main(): Promise<void> {
    if (!process.env.NODEHIVE_API_KEY) {
        console.error('❌ NODEHIVE_API_KEY not found in .env\n');
        process.exit(1);
    }

    await demonstrateTypeSafety();
    await oauthExample();
}

main();
