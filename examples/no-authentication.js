/**
 * No Authentication Example
 *
 * This example demonstrates using NodeHiveClient to access PUBLIC content
 * without any authentication. This is useful when:
 *
 * ✅ Use Cases:
 * - Accessing publicly available content (published articles, pages, etc.)
 * - Building public-facing websites or applications
 * - Fetching content that doesn't require user permissions
 * - Static site generation from public content
 * - Public API endpoints that don't require authentication
 *
 * ❌ Limitations:
 * - Cannot access unpublished content
 * - Cannot access user-specific or protected content
 * - Cannot create, update, or delete content
 * - May have rate limiting or other restrictions
 * - Some endpoints may require authentication even for read operations
 *
 * Setup:
 * 1. Configure DRUPAL_BASE_URL in .env
 * 2. No authentication credentials needed!
 * 3. Run: node no-authentication.js
 *
 * See README.md for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('═══════════════════════════════════════');
console.log('   NodeHive - No Authentication');
console.log('   Accessing Public Content Only');
console.log('═══════════════════════════════════════\n');

// ============================================================
// Example 1: Basic Client Setup (No Auth)
// ============================================================
console.log('--- Example 1: Client Without Authentication ---\n');

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://demo.nodehive.app'
    // Notice: No auth configuration at all!
});

async function checkAuthenticationStatus() {
    console.log('✓ Client configured without authentication');
    console.log('  Base URL:', client.baseUrl);

    const isLoggedIn = await client.isLoggedIn();
    console.log('✓ Authenticated:', isLoggedIn);
    console.log('  → Expected: false (no authentication configured)\n');
}

// ============================================================
// Example 2: Accessing Public Content
// ============================================================
console.log('--- Example 2: Fetching Public Content ---\n');

async function fetchPublicContent() {
    try {
        console.log('Fetching published articles...');
        const articles = await client.getNodes('article', {
            params: {
                'page[limit]': 5,
                'filter[status]': 1  // Published content only
            }
        });

        console.log('✓ Fetched', articles.data?.length || 0, 'published articles');

        if (articles.data?.[0]) {
            console.log('\nFirst article:');
            console.log('  Title:', articles.data[0].attributes?.title);
            console.log('  Status:', articles.data[0].attributes?.status ? 'Published' : 'Unpublished');
        }

        console.log('\nFetching content types...');
        const contentTypes = await client.getContentTypes();
        console.log('✓ Fetched', contentTypes.data?.length || 0, 'content types');

        console.log('\nFetching public media...');
        const media = await client.getMediaList('image', {
            params: { 'page[limit]': 3 }
        });
        console.log('✓ Fetched', media.data?.length || 0, 'images');

        console.log('\nFetching menu items...');
        const menus = await client.getMenus();
        console.log('✓ Fetched', menus.data?.length || 0, 'menus');

    } catch (error) {
        console.error('✗ Request failed:', error.message);
        if (error.status === 401 || error.status === 403) {
            console.error('\nℹ️  This endpoint requires authentication.');
            console.error('   Consider using one of these methods:');
            console.error('   1. NodeHive API Key (simplest)');
            console.error('   2. OAuth Password Grant (user auth)');
            console.error('   3. OAuth Client Credentials (service account)');
        }
    }
}

// ============================================================
// Example 3: What You CAN and CANNOT Do
// ============================================================
console.log('\n--- Example 3: Capabilities Without Authentication ---\n');

async function demonstrateCapabilities() {
    console.log('✅ You CAN:');
    console.log('   → Read published content (articles, pages, etc.)');
    console.log('   → Access public media files');
    console.log('   → Fetch menu structures');
    console.log('   → Get content type definitions');
    console.log('   → Access any endpoint marked as publicly accessible\n');

    console.log('❌ You CANNOT:');
    console.log('   → Access unpublished content');
    console.log('   → Create new content');
    console.log('   → Update existing content');
    console.log('   → Delete content');
    console.log('   → Access user-specific data');
    console.log('   → Access protected or private content');
    console.log('   → Perform any operations requiring permissions\n');

    // Try to access something that might require auth
    console.log('Example: Attempting to fetch all articles (including unpublished)...');
    try {
        const allArticles = await client.getNodes('article', {
            params: {
                'page[limit]': 5
                // No status filter - might include unpublished
            }
        });
        console.log('✓ Success! Fetched', allArticles.data?.length || 0, 'articles');
        console.log('  → This endpoint allows public access\n');
    } catch (error) {
        console.log('✗ Failed:', error.message);
        console.log('  → This endpoint requires authentication\n');
    }
}

// ============================================================
// Example 4: Comparison with Authenticated Clients
// ============================================================
console.log('--- Example 4: When to Use Authentication ---\n');

function showAuthenticationComparison() {
    console.log('📊 Public vs Authenticated Access:\n');

    console.log('🌍 No Authentication (Current Example)');
    console.log('   Use when:');
    console.log('   ✓ Building public-facing websites');
    console.log('   ✓ Displaying published content only');
    console.log('   ✓ No user-specific features needed');
    console.log('   ✓ Read-only access is sufficient');
    console.log('   Benefits:');
    console.log('   ✓ Simpler setup - no credentials needed');
    console.log('   ✓ No token management');
    console.log('   ✓ No expiration concerns');
    console.log('   Drawbacks:');
    console.log('   ✗ Limited to public content only');
    console.log('   ✗ No write operations\n');

    console.log('🔐 NodeHive API Key Authentication');
    console.log('   Use when:');
    console.log('   ✓ Server-to-server communication needed');
    console.log('   ✓ Need consistent API access');
    console.log('   ✓ Want simple authentication');
    console.log('   ✓ Need to access protected content');
    console.log('   See: examples/nodehive-api-key.js\n');

    console.log('👤 OAuth Password Grant');
    console.log('   Use when:');
    console.log('   ✓ Need user-specific authentication');
    console.log('   ✓ Building user-facing applications');
    console.log('   ✓ Need user permissions and roles');
    console.log('   See: examples/oauth-password-grant.js\n');

    console.log('🤖 OAuth Client Credentials');
    console.log('   Use when:');
    console.log('   ✓ Service account access needed');
    console.log('   ✓ No user context required');
    console.log('   ✓ Standard OAuth 2.0 flow preferred');
    console.log('   See: examples/oauth-client-credentials.js\n');
}

// ============================================================
// Example 5: Error Handling for Public Access
// ============================================================
console.log('--- Example 5: Error Handling ---\n');

async function demonstrateErrorHandling() {
    console.log('Handling common scenarios:\n');

    // Scenario 1: Public content (should work)
    try {
        console.log('1. Accessing public endpoint...');
        const result = await client.getContentTypes();
        console.log('   ✓ Success - Content types are publicly accessible\n');
    } catch (error) {
        console.log('   ✗ Failed:', error.message, '\n');
    }

    // Scenario 2: Protected content (might fail)
    try {
        console.log('2. Attempting to access potentially protected content...');
        const users = await client.request('/jsonapi/user/user');
        console.log('   ✓ Success - User list is publicly accessible');
        console.log('   Note: This varies by Drupal configuration\n');
    } catch (error) {
        if (error.status === 401) {
            console.log('   ✗ 401 Unauthorized - Authentication required');
            console.log('   → Add authentication to access this endpoint\n');
        } else if (error.status === 403) {
            console.log('   ✗ 403 Forbidden - Insufficient permissions');
            console.log('   → This endpoint requires specific permissions\n');
        } else {
            console.log('   ✗ Error:', error.message, '\n');
        }
    }
}

// ============================================================
// Example 6: Building a Public Blog
// ============================================================
console.log('--- Example 6: Real-World Use Case - Public Blog ---\n');

async function buildPublicBlog() {
    console.log('Simulating a public blog build process:\n');

    try {
        // Step 1: Fetch all published articles
        console.log('Step 1: Fetching published articles...');
        const articles = await client.getNodes('article', {
            params: {
                'filter[status]': 1,  // Published only
                'sort': '-created',    // Newest first
                'page[limit]': 10
            }
        });
        console.log(`✓ Found ${articles.data?.length || 0} published articles\n`);

        // Step 2: Fetch featured images
        console.log('Step 2: Fetching featured images...');
        const images = await client.getMediaList('image', {
            params: { 'page[limit]': 5 }
        });
        console.log(`✓ Found ${images.data?.length || 0} images\n`);

        // Step 3: Fetch navigation menu
        console.log('Step 3: Fetching navigation menu...');
        const menus = await client.getMenus();
        console.log(`✓ Found ${menus.data?.length || 0} menus\n`);

        console.log('✅ Blog data fetched successfully!');
        console.log('   You can now build your static site or frontend\n');

    } catch (error) {
        console.error('✗ Blog build failed:', error.message);
        console.error('   Check that your Drupal site allows public access to these endpoints\n');
    }
}

// ============================================================
// Example 7: Configuration for Public Access
// ============================================================
console.log('--- Example 7: Alternative Configuration Styles ---\n');

function showConfigurationExamples() {
    console.log('Style 1 - Minimal (Recommended for public access):');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: "https://your-site.com"');
    console.log('});');
    console.log('```\n');

    console.log('Style 2 - With explicit auth: false (optional):');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: "https://your-site.com",');
    console.log('    auth: false  // Explicitly disable authentication');
    console.log('});');
    console.log('```\n');

    console.log('Style 3 - Environment variable:');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: process.env.DRUPAL_BASE_URL');
    console.log('});');
    console.log('```\n');
}

// ============================================================
// Main Execution
// ============================================================
async function main() {
    try {
        // Run all examples
        await checkAuthenticationStatus();
        showAuthenticationComparison();
        showConfigurationExamples();
        await fetchPublicContent();
        await demonstrateCapabilities();
        await demonstrateErrorHandling();
        await buildPublicBlog();

        console.log('═══════════════════════════════════════');
        console.log('   ✨ All examples completed!');
        console.log('═══════════════════════════════════════');
        console.log('\n💡 Key Takeaway:');
        console.log('   No authentication is perfect for public content!');
        console.log('   Add authentication only when you need:');
        console.log('   - Protected content access');
        console.log('   - Write operations (create/update/delete)');
        console.log('   - User-specific features\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

// Run the examples
main();
