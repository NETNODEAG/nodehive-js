/**
 * OAuth Client Credentials Grant (Server-to-Server Authentication)
 *
 * This example demonstrates how to use OAuth Client Credentials Grant for
 * server-to-server authentication without requiring user credentials.
 *
 * Perfect for:
 * - Service accounts
 * - Backend-to-backend communication
 * - API integrations
 * - Automated tasks/cron jobs
 *
 * Setup:
 * 1. Copy .env.example to .env in this directory
 * 2. Fill in your OAuth client credentials
 * 3. Run: node oauth-client-credentials.js
 *
 * See README.md for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('═══════════════════════════════════════');
console.log('   OAuth Client Credentials Grant');
console.log('   Server-to-Server Authentication');
console.log('═══════════════════════════════════════\n');

// ============================================================
// Example 1: Basic Client Credentials Authentication
// ============================================================
console.log('--- Example 1: Basic Client Credentials ---\n');

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'client_credentials', // This is the key!
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        }
    }
});

async function basicClientCredentials() {
    try {
        console.log('Authenticating with client credentials...');

        // Call login() without username/password
        // It will automatically use client credentials grant
        const result = await client.login();

        console.log('✓ Authentication successful!');
        console.log('  - Token:', result.token.substring(0, 50) + '...');
        console.log('  - Token type:', result.token_type);
        console.log('  - Expires in:', result.expires_in, 'seconds');
        console.log('  - Scope:', result.scope || 'default');

        const expiresAt = await client.auth.getTokenExpiresAt();
        if (expiresAt) {
            console.log('  - Stored expiresAt:', new Date(expiresAt).toISOString());
        }

        return result;
    } catch (error) {
        console.error('✗ Authentication failed:', error.message);
        console.error('\nℹ️  Note: Client Credentials Grant requires Drupal Simple OAuth configuration:');
        console.error('   1. Ensure the OAuth client has "Client Credentials" grant enabled');
        console.error('   2. In Drupal: /admin/config/services/consumer/[consumer-id]/edit');
        console.error('   3. Check "Client Credentials" under "Grant Types"');
        console.error('   4. Alternatively, use Password Grant (oauth-authentication.js example)\n');
        throw error;
    }
}

// ============================================================
// Example 2: Making API Requests
// ============================================================
console.log('\n--- Example 2: Making API Requests ---\n');

async function makeApiRequests() {
    try {
        // Authenticate first
        await client.login();
        console.log('✓ Authenticated as service account\n');

        if (await client.auth.isTokenExpired()) {
            console.log('⚠ Token already expired, re-authenticating...');
            await client.login();
        }

        // Now make requests just like with user authentication
        console.log('Fetching content types...');
        const contentTypes = await client.getContentTypes();
        console.log('✓ Fetched', contentTypes.data?.length || 0, 'content types');

        console.log('\nFetching articles...');
        const articles = await client.getNodes('article', {
            params: { 'page[limit]': 5 }
        });
        console.log('✓ Fetched', articles.data?.length || 0, 'articles');

        console.log('\nFetching media...');
        const media = await client.getMediaList('image', {
            params: { 'page[limit]': 5 }
        });
        console.log('✓ Fetched', media.data?.length || 0, 'images');

    } catch (error) {
        console.error('✗ API request failed:', error.message);
    }
}

// ============================================================
// Example 3: With Scopes (if configured in Drupal)
// ============================================================
console.log('\n--- Example 3: Authentication with Scopes ---\n');

const clientWithScope = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'client_credentials',
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            scope: 'read write' // Optional: specify required scopes
        }
    }
});

async function authWithScopes() {
    try {
        console.log('Authenticating with specific scopes...');
        const result = await clientWithScope.login();
        console.log('✓ Authenticated with scopes:', result.scope || 'default');
    } catch (error) {
        console.error('ℹ️  Scope-based auth:', error.message);
        console.log('   (Scopes may not be configured in your Drupal instance)');
    }
}

// ============================================================
// Example 4: Token Caching Strategy
// ============================================================
console.log('\n--- Example 4: Token Caching Strategy ---\n');

let cachedClient = null;

async function getAuthenticatedClient() {
    // Check if we already have an authenticated client
    if (cachedClient) {
        const isLoggedIn = await cachedClient.isLoggedIn();
        if (isLoggedIn) {
            console.log('✓ Using cached authenticated client');
            return cachedClient;
        }
    }

    // Create new client and authenticate
    console.log('Creating new client and authenticating...');
    cachedClient = new NodeHiveClient({
        baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
        auth: {
            method: 'oauth',
            oauth: {
                grantType: 'client_credentials',
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET
            }
        }
    });

    await cachedClient.login();
    console.log('✓ New client authenticated and cached');
    return cachedClient;
}

async function demonstrateCaching() {
    console.log('First request (creates new client):');
    const client1 = await getAuthenticatedClient();
    const nodes1 = await client1.getNodes('article', {
        params: { 'page[limit]': 1 }
    });
    console.log('  - Fetched', nodes1.data?.length || 0, 'nodes\n');

    console.log('Second request (uses cached client):');
    const client2 = await getAuthenticatedClient();
    const nodes2 = await client2.getNodes('article', {
        params: { 'page[limit]': 1 }
    });
    console.log('  - Fetched', nodes2.data?.length || 0, 'nodes');
}

// ============================================================
// Example 5: Comparison with Password Grant
// ============================================================
console.log('\n--- Example 5: Password vs Client Credentials ---\n');

function showComparison() {
    console.log('Password Grant (User Authentication):');
    console.log('  ✓ Requires username and password');
    console.log('  ✓ Acts on behalf of a specific user');
    console.log('  ✓ User permissions apply');
    console.log('  ✓ Includes refresh token');
    console.log('  ✓ Use for: User-facing applications\n');

    console.log('Client Credentials Grant (Service Account):');
    console.log('  ✓ No username/password needed');
    console.log('  ✓ Acts as service account');
    console.log('  ✓ Client permissions apply');
    console.log('  ✓ No refresh token (re-authenticate when expired)');
    console.log('  ✓ Use for: Server-to-server, background tasks, APIs\n');
}

// ============================================================
// Main Execution
// ============================================================
async function main() {
    try {
        // Run basic example
        await basicClientCredentials();

        // Show comparison
        showComparison();

        // Make API requests
        await makeApiRequests();

        // Demonstrate scopes
        await authWithScopes();

        // Demonstrate caching
        await demonstrateCaching();

        console.log('\n═══════════════════════════════════════');
        console.log('   Best Practices');
        console.log('═══════════════════════════════════════\n');

        console.log('✅ DO:');
        console.log('  - Use client credentials for server-to-server');
        console.log('  - Cache the authenticated client instance');
        console.log('  - Re-authenticate when token expires (check client.auth.isTokenExpired())');
        console.log('  - Store credentials in environment variables');
        console.log('  - Use HTTPS for production\n');

        console.log('❌ DON\'T:');
        console.log('  - Use for user-facing authentication');
        console.log('  - Expose client secret in frontend code');
        console.log('  - Create new client for every request');
        console.log('  - Hardcode credentials in code\n');

        console.log('═══════════════════════════════════════');
        console.log('   All examples completed!');
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

// Run the examples
main();
