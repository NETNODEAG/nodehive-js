/**
 * NodeHive API Key Authentication
 *
 * This is the SIMPLEST and RECOMMENDED method for server-to-server authentication!
 * Perfect for accessing public content through protected API endpoints.
 *
 * Benefits:
 * - ✅ No login required - just pass the API key
 * - ✅ No token expiration to manage
 * - ✅ No OAuth configuration needed
 * - ✅ Single line configuration
 * - ✅ Perfect for public content APIs
 *
 * Setup:
 * 1. Create an API Key in NodeHive: /nodehive/api-keys
 * 2. Select a user (permissions of this user apply to API access)
 * 3. Copy the generated API key
 * 4. Add to .env: NODEHIVE_API_KEY=nhk_...
 * 5. Run: node nodehive-api-key.js
 *
 * See README.md for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('═══════════════════════════════════════');
console.log('   NodeHive API Key Authentication');
console.log('   Simplest Method for Server-to-Server');
console.log('═══════════════════════════════════════\n');

// ============================================================
// Example 1: Basic API Key Setup (RECOMMENDED)
// ============================================================
console.log('--- Example 1: Basic API Key Authentication ---\n');

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://demo.nodehive.app',
    auth: {
        apiKey: process.env.NODEHIVE_API_KEY // That's it! One line.
    }
});

async function basicApiKeyAuth() {
    try {
        console.log('✓ Client configured with API Key');
        console.log('  API Key:', process.env.NODEHIVE_API_KEY?.substring(0, 20) + '...\n');

        // Check if authenticated (no login() call needed!)
        const isLoggedIn = await client.isLoggedIn();
        console.log('✓ Authenticated:', isLoggedIn);

        return true;
    } catch (error) {
        console.error('✗ Configuration error:', error.message);
        return false;
    }
}

// ============================================================
// Example 2: Making API Requests
// ============================================================
console.log('\n--- Example 2: Making API Requests ---\n');

async function makeApiRequests() {
    try {
        // No login needed - just start making requests!
        console.log('Fetching content types...');
        const contentTypes = await client.getContentTypes();
        console.log('✓ Fetched', contentTypes.data?.length || 0, 'content types');

        console.log('\nFetching articles...');
        const articles = await client.getNodes('article', {
            params: { 'page[limit]': 5 }
        });
        console.log('✓ Fetched', articles.data?.length || 0, 'articles');

        if (articles.data?.[0]) {
            console.log('  First article:', articles.data[0].attributes?.title);
        }

        console.log('\nFetching media...');
        const media = await client.getMediaList('image', {
            params: { 'page[limit]': 3 }
        });
        console.log('✓ Fetched', media.data?.length || 0, 'images');

        console.log('\nFetching menus...');
        const menus = await client.getMenus();
        console.log('✓ Fetched', menus.data?.length || 0, 'menus');

    } catch (error) {
        console.error('✗ API request failed:', error.message);
        if (error.status === 401) {
            console.error('\nℹ️  Authentication failed. Please check:');
            console.error('   1. NODEHIVE_API_KEY is set in .env');
            console.error('   2. API Key is valid (check /nodehive/api-keys)');
            console.error('   3. User assigned to API key has proper permissions');
        }
    }
}

// ============================================================
// Example 3: Comparison with Other Methods
// ============================================================
console.log('\n--- Example 3: Method Comparison ---\n');

function showComparison() {
    console.log('📊 Authentication Method Comparison:\n');

    console.log('1️⃣  NodeHive API Key (RECOMMENDED for most use cases)');
    console.log('   ✅ Simplest setup - just one line');
    console.log('   ✅ No expiration - works forever');
    console.log('   ✅ No login() call needed');
    console.log('   ✅ Perfect for public content APIs');
    console.log('   ✅ User permissions apply');
    console.log('   ❌ Not suitable if you need user-specific actions\n');

    console.log('2️⃣  OAuth Client Credentials (For advanced OAuth needs)');
    console.log('   ✅ Standard OAuth 2.0 flow');
    console.log('   ✅ Token-based with expiration');
    console.log('   ❌ Requires OAuth client configuration');
    console.log('   ❌ More complex setup\n');

    console.log('3️⃣  OAuth Password Grant (For user authentication)');
    console.log('   ✅ Authenticate as specific user');
    console.log('   ✅ User-specific permissions');
    console.log('   ❌ Requires username/password');
    console.log('   ❌ Not suitable for service accounts\n');

    console.log('4️⃣  JWT (Legacy)');
    console.log('   ✅ Simple user authentication');
    console.log('   ❌ Deprecated - use OAuth instead\n');
}

// ============================================================
// Example 4: Different Configuration Styles
// ============================================================
console.log('\n--- Example 4: Configuration Styles ---\n');

function showConfigurationExamples() {
    console.log('Style 1 - Direct API Key (Recommended):');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: process.env.DRUPAL_BASE_URL,');
    console.log('    auth: {');
    console.log('        apiKey: process.env.NODEHIVE_API_KEY');
    console.log('    }');
    console.log('});');
    console.log('```\n');

    console.log('Style 2 - Explicit Method:');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: process.env.DRUPAL_BASE_URL,');
    console.log('    auth: {');
    console.log('        method: "nodehive-api-key",');
    console.log('        apiKey: process.env.NODEHIVE_API_KEY');
    console.log('    }');
    console.log('});');
    console.log('```\n');

    console.log('Style 3 - Hardcoded (Not recommended for production):');
    console.log('```javascript');
    console.log('const client = new NodeHiveClient({');
    console.log('    baseUrl: "https://your-site.com",');
    console.log('    auth: {');
    console.log('        apiKey: "nhk_your_api_key_here"');
    console.log('    }');
    console.log('});');
    console.log('```\n');
}

// ============================================================
// Example 5: Error Handling
// ============================================================
console.log('\n--- Example 5: Error Handling Best Practices ---\n');

async function demonstrateErrorHandling() {
    try {
        const articles = await client.getNodes('article');
        console.log('✓ Request successful');
    } catch (error) {
        if (error.status === 401) {
            console.log('❌ Authentication Error (401):');
            console.log('   → Check API key is valid');
            console.log('   → Verify user permissions');
        } else if (error.status === 403) {
            console.log('❌ Permission Error (403):');
            console.log('   → User lacks permission for this operation');
            console.log('   → Check role permissions in Drupal');
        } else if (error.status === 404) {
            console.log('❌ Not Found (404):');
            console.log('   → Resource does not exist');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

// ============================================================
// Example 6: Production Setup Tips
// ============================================================
console.log('\n--- Example 6: Production Best Practices ---\n');

function showProductionTips() {
    console.log('🚀 Production Setup Checklist:\n');

    console.log('1. Create Dedicated API User:');
    console.log('   → User: "api_service" or "nodehive_api"');
    console.log('   → Role: "API Access Role"');
    console.log('   → Permissions: Minimal required permissions\n');

    console.log('2. Create API Role:');
    console.log('   → Permission: "Access API Endpoints"');
    console.log('   → Permission: "View published content"');
    console.log('   → Permission: Any other needed permissions\n');

    console.log('3. Generate API Key:');
    console.log('   → Visit: /nodehive/api-keys');
    console.log('   → Create new API key');
    console.log('   → Select your API user');
    console.log('   → Copy the generated key (starts with nhk_)\n');

    console.log('4. Secure Storage:');
    console.log('   → Store in environment variable');
    console.log('   → Never commit to git');
    console.log('   → Use secrets management in production');
    console.log('   → Rotate keys periodically\n');

    console.log('5. Test Configuration:');
    console.log('   → Visit: https://nodehive-explorer.vercel.app/');
    console.log('   → Test your API key');
    console.log('   → Verify permissions\n');
}

// ============================================================
// Main Execution
// ============================================================
async function main() {
    try {
        // Check if API key is configured
        if (!process.env.NODEHIVE_API_KEY) {
            console.error('❌ NODEHIVE_API_KEY not found in environment variables\n');
            console.error('Setup Instructions:');
            console.error('1. Copy .env.example to .env');
            console.error('2. Add: NODEHIVE_API_KEY=nhk_your_key_here');
            console.error('3. Get your key from: /nodehive/api-keys\n');
            process.exit(1);
        }

        // Run examples
        await basicApiKeyAuth();
        showComparison();
        showConfigurationExamples();
        await makeApiRequests();
        await demonstrateErrorHandling();
        showProductionTips();

        console.log('\n═══════════════════════════════════════');
        console.log('   ✨ All examples completed!');
        console.log('═══════════════════════════════════════');
        console.log('\n💡 Key Takeaway:');
        console.log('   API Key is the SIMPLEST method for most use cases!');
        console.log('   Just set apiKey in config and start making requests.\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

// Run the examples
main();
