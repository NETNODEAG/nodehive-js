/**
 * JWT Authentication Examples
 *
 * This file demonstrates JWT (JSON Web Token) authentication with NodeHive Client.
 * JWT is the legacy authentication method, now superseded by OAuth.
 *
 * Setup:
 * 1. Copy .env.example to .env in this directory
 * 2. Fill in your JWT credentials in the .env file
 * 3. Run: node jwt-authentication.js
 *
 * See README.md in this directory for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Example 1: JWT authentication (legacy)
const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'jwt' // Explicitly set to JWT
    }
});

// Login with JWT
async function loginWithJWT() {
    try {
        const email = process.env.JWT_EMAIL;
        const password = process.env.JWT_PASSWORD;

        console.log('Logging in with JWT...');
        const result = await client.login(email, password);

        console.log('✓ JWT Login successful!');
        console.log('Token:', result.token);
        console.log('User:', result.user);

        return result;
    } catch (error) {
        console.error('✗ Login failed:', error.message);
        throw error;
    }
}

// Check if logged in
async function checkLoginStatus() {
    const isLoggedIn = await client.isLoggedIn();
    console.log('Is logged in?', isLoggedIn);
    return isLoggedIn;
}

// Validate session
async function validateSession() {
    try {
        console.log('Validating session...');
        const isValid = await client.hasValidSession();
        console.log('Session valid?', isValid);
        return isValid;
    } catch (error) {
        console.error('Session validation error:', error.message);
        return false;
    }
}

// Get user details
async function getUserDetails() {
    try {
        console.log('Fetching user details...');
        const userDetails = await client.getUserDetails();
        console.log('User details:', userDetails);
        return userDetails;
    } catch (error) {
        console.error('Failed to get user details:', error.message);
        return null;
    }
}

// Get token
async function getToken() {
    const token = await client.getToken();
    console.log('Current token:', token ? token.substring(0, 20) + '...' : 'None');
    return token;
}

// Make authenticated requests
async function makeAuthenticatedRequests() {
    try {
        console.log('\n--- Making authenticated requests ---');

        // Fetch content types
        console.log('Fetching content types...');
        const contentTypes = await client.getContentTypes();
        console.log('✓ Found', contentTypes.data?.length || 0, 'content types');

        // Fetch nodes
        console.log('Fetching articles...');
        const articles = await client.getNodes('article', {
            params: {
                'page[limit]': 5
            }
        });
        console.log('✓ Found', articles.data?.length || 0, 'articles');

    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

// Logout
async function logout() {
    try {
        console.log('\n--- Logging out ---');
        await client.logout();
        console.log('✓ Logged out successfully');

        const isLoggedIn = await client.isLoggedIn();
        console.log('Still logged in?', isLoggedIn);
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}

// Example 2: JWT with pre-configured token
const clientWithToken = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'jwt',
        token: process.env.JWT_TOKEN // Pre-configured token (if available)
    }
});

async function usePreConfiguredToken() {
    if (!process.env.JWT_TOKEN) {
        console.log('\n--- Pre-configured token example skipped (no JWT_TOKEN in .env) ---');
        return;
    }

    console.log('\n--- Using pre-configured token ---');
    try {
        const isLoggedIn = await clientWithToken.isLoggedIn();
        console.log('Logged in with pre-configured token?', isLoggedIn);

        if (isLoggedIn) {
            const contentTypes = await clientWithToken.getContentTypes();
            console.log('✓ Fetched', contentTypes.data?.length || 0, 'content types');
        }
    } catch (error) {
        console.error('✗ Error with pre-configured token:', error.message);
    }
}

// Example 3: JWT with persistent storage
const clientWithStorage = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'jwt',
        storage: {
            type: 'memory' // Options: 'memory', 'localStorage', 'sessionStorage', 'cookie'
        }
    }
});

async function demonstrateStorage() {
    console.log('\n--- Storage persistence example ---');
    try {
        const email = process.env.JWT_EMAIL;
        const password = process.env.JWT_PASSWORD;

        // Login
        await clientWithStorage.login(email, password);
        console.log('✓ Logged in and stored credentials');

        // Token should persist in storage
        const token = await clientWithStorage.getToken();
        console.log('✓ Token retrieved from storage:', token ? 'Yes' : 'No');

        // Make a request
        const contentTypes = await clientWithStorage.getContentTypes();
        console.log('✓ Request successful with stored token');

        // Logout
        await clientWithStorage.logout();
        console.log('✓ Logged out and cleared storage');

        const tokenAfterLogout = await clientWithStorage.getToken();
        console.log('✓ Token after logout:', tokenAfterLogout || 'None');
    } catch (error) {
        console.error('✗ Storage demo error:', error.message);
    }
}

// Run all examples
async function main() {
    console.log('═══════════════════════════════════════');
    console.log('   JWT Authentication Examples');
    console.log('═══════════════════════════════════════\n');

    try {
        // Basic JWT login flow
        console.log('--- Example 1: Basic JWT Login ---');
        await loginWithJWT();
        await checkLoginStatus();
        await getToken();
        await getUserDetails();
        await validateSession();
        await makeAuthenticatedRequests();
        await logout();

        // Pre-configured token
        await usePreConfiguredToken();

        // Storage demonstration
        await demonstrateStorage();

        console.log('\n═══════════════════════════════════════');
        console.log('   All examples completed!');
        console.log('═══════════════════════════════════════\n');
    } catch (error) {
        console.error('\n✗ Error running examples:', error.message);
        process.exit(1);
    }
}

// Run the examples
main();
