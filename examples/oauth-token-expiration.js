/**
 * OAuth Token Expiration Example
 *
 * This file demonstrates how the NodeHive Client handles OAuth token expiration
 * and automatic token refresh.
 *
 * Setup:
 * 1. Copy .env.example to .env in this directory
 * 2. Fill in your OAuth credentials in the .env file
 * 3. Run: node oauth-token-expiration.js
 *
 * See README.md in this directory for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create client with OAuth authentication
const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    debug: true, // Enable debug logging to see token refresh
    auth: {
        method: 'oauth',
        oauth: {
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        }
    }
});

console.log('═══════════════════════════════════════');
console.log('   OAuth Token Expiration Demo');
console.log('═══════════════════════════════════════\n');

// Example 1: Normal token usage
async function normalTokenUsage() {
    console.log('--- Example 1: Normal Token Usage ---\n');

    try {
        // Login to get initial token
        const username = process.env.OAUTH_USERNAME;
        const password = process.env.OAUTH_PASSWORD;

        console.log('1. Logging in...');
        const loginResult = await client.login(username, password);
        console.log('✓ Login successful');
        console.log('  - Access token expires in:', loginResult.expires_in, 'seconds');
        console.log('  - Refresh token available:', !!loginResult.refresh_token);

        // Make a request with valid token
        console.log('\n2. Making request with valid token...');
        const nodes = await client.getNodes('article', {
            params: { 'page[limit]': 3 }
        });
        console.log('✓ Request successful');
        console.log('  - Fetched', nodes.data?.length || 0, 'nodes');

    } catch (error) {
        console.error('✗ Error:', error.message);
    }
}

// Example 2: Manual token refresh
async function manualTokenRefresh() {
    console.log('\n--- Example 2: Manual Token Refresh ---\n');

    try {
        // Login first
        const username = process.env.OAUTH_USERNAME;
        const password = process.env.OAUTH_PASSWORD;

        console.log('1. Logging in...');
        const loginResult = await client.login(username, password);
        console.log('✓ Login successful');

        const oldToken = loginResult.token.substring(0, 50) + '...';
        console.log('  - Token (first 50 chars):', oldToken);

        // Wait a moment
        console.log('\n2. Refreshing token manually...');
        const refreshResult = await client.refreshToken();
        console.log('✓ Token refreshed successfully');

        const newToken = refreshResult.token.substring(0, 50) + '...';
        console.log('  - New token (first 50 chars):', newToken);
        console.log('  - New token expires in:', refreshResult.expires_in, 'seconds');
        console.log('  - Token changed:', oldToken !== newToken ? 'Yes' : 'No');

        const expiresAt = await client.auth.getTokenExpiresAt();
        if (expiresAt) {
            console.log('  - Stored expiresAt:', new Date(expiresAt).toISOString());
        }

        // Make a request with refreshed token
        console.log('\n3. Making request with refreshed token...');
        const nodes = await client.getNodes('article', {
            params: { 'page[limit]': 3 }
        });
        console.log('✓ Request successful with refreshed token');
        console.log('  - Fetched', nodes.data?.length || 0, 'nodes');

    } catch (error) {
        console.error('✗ Error:', error.message);
    }
}

// Example 3: Automatic token refresh on expiration
async function automaticTokenRefresh() {
    console.log('\n--- Example 3: Automatic Token Refresh ---\n');

    console.log('ℹ️  The client automatically refreshes expired OAuth tokens');
    console.log('   when a request returns 401 Unauthorized.\n');

    try {
        const username = process.env.OAUTH_USERNAME;
        const password = process.env.OAUTH_PASSWORD;

        console.log('1. Logging in...');
        await client.login(username, password);
        console.log('✓ Login successful');

        console.log('\n2. Making authenticated request...');
        const nodes = await client.getNodes('article', {
            params: { 'page[limit]': 3 }
        });
        console.log('✓ Request successful');

        console.log('\nℹ️  If the token had expired, the client would:');
        console.log('   1. Receive 401 error from the API');
        console.log('   2. Automatically call refreshToken()');
        console.log('   3. Retry the request with the new token');
        console.log('   4. Return the result (transparent to your code!)');
        console.log('   (You can also poll client.auth.isTokenExpired() before making requests.)');

    } catch (error) {
        console.error('✗ Error:', error.message);
    }
}

// Example 4: What happens when refresh token is invalid
async function expiredRefreshToken() {
    console.log('\n--- Example 4: Expired Refresh Token ---\n');

    console.log('ℹ️  If the refresh token is also expired or invalid:\n');
    console.log('   1. Token refresh will fail');
    console.log('   2. The client will throw a 401 error');
    console.log('   3. Your app should catch this and re-authenticate');
    console.log('   4. Call client.login() again to get new tokens\n');

    // Example error handling
    console.log('Example error handling pattern:\n');
    console.log('```javascript');
    console.log('try {');
    console.log('  const data = await client.getNodes("article");');
    console.log('} catch (error) {');
    console.log('  if (error.status === 401) {');
    console.log('    // Token refresh failed, need to re-login');
    console.log('    await client.login(username, password);');
    console.log('    // Retry the request');
    console.log('    const data = await client.getNodes("article");');
    console.log('  }');
    console.log('}');
    console.log('```');
}

// Example 5: Token lifecycle summary
async function tokenLifecycleSummary() {
    console.log('\n═══════════════════════════════════════');
    console.log('   OAuth Token Lifecycle');
    console.log('═══════════════════════════════════════\n');

    console.log('📍 Token States and Behavior:\n');

    console.log('1️⃣  Fresh Token (after login)');
    console.log('   → All requests work normally');
    console.log('   → Token valid for ~5 minutes (300 seconds)\n');

    console.log('2️⃣  Token Expiring Soon');
    console.log('   → You can manually refresh: client.refreshToken()');
    console.log('   → Or let automatic refresh handle it\n');

    console.log('3️⃣  Token Expired');
    console.log('   → Request returns 401 Unauthorized');
    console.log('   → Client automatically calls refreshToken()');
    console.log('   → Request retried with new token (seamless!)\n');

    console.log('4️⃣  Refresh Token Expired');
    console.log('   → Both tokens are invalid');
    console.log('   → Client throws 401 error');
    console.log('   → Must call login() again\n');

    console.log('💡 Best Practices:\n');
    console.log('   ✓ Let automatic refresh handle expiration');
    console.log('   ✓ Catch 401 errors and re-authenticate if needed');
    console.log('   ✓ Store refresh token securely (using storage adapters)');
    console.log('   ✓ Use interceptors for centralized error handling');
}

// Run all examples
async function main() {
    try {
        await normalTokenUsage();
        await manualTokenRefresh();
        await automaticTokenRefresh();
        await expiredRefreshToken();
        await tokenLifecycleSummary();

        console.log('\n═══════════════════════════════════════');
        console.log('   Demo completed!');
        console.log('═══════════════════════════════════════\n');
    } catch (error) {
        console.error('\n✗ Error running examples:', error.message);
        process.exit(1);
    }
}

// Run the demo
main();
