/**
 * OAuth Authentication Examples
 *
 * This file demonstrates different authentication methods with NodeHive Client.
 *
 * Setup:
 * 1. Copy .env.example to .env in this directory
 * 2. Fill in your credentials in the .env file
 * 3. Run: node oauth-authentication.js
 *
 * See README.md in this directory for more information.
 */

import { NodeHiveClient } from '../package/index.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Example 1: OAuth authentication (default)
const clientOAuth = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'oauth', // This is the default, can be omitted
        oauth: {
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        }
    }
});

// Login with OAuth
async function loginWithOAuth() {
    try {
        const username = process.env.OAUTH_USERNAME;
        const password = process.env.OAUTH_PASSWORD;

        const result = await clientOAuth.login(username, password);
        console.log('OAuth Login successful!');
        console.log('Token:', result.token);
        console.log('Refresh Token:', result.refresh_token);
        console.log('Expires in:', result.expires_in, 'seconds');
        console.log('User:', result.user);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

// Refresh OAuth token
async function refreshOAuthToken() {
    try {
        const result = await clientOAuth.refreshToken();
        console.log('Token refreshed successfully!');
        console.log('New Token:', result.token);
    } catch (error) {
        console.error('Token refresh failed:', error.message);
    }
}

// Example 2: JWT authentication (legacy)
const clientJWT = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'jwt'
    }
});

// Login with JWT
async function loginWithJWT() {
    try {
        const email = process.env.JWT_EMAIL;
        const password = process.env.JWT_PASSWORD;

        const result = await clientJWT.login(email, password);
        console.log('JWT Login successful!');
        console.log('Token:', result.token);
        console.log('User:', result.user);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

// Example 3: OAuth with per-request credentials
const clientOAuthDynamic = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL || 'https://netnode.nodehive.app',
    auth: {
        method: 'oauth'
    }
});

// Login with dynamic OAuth credentials
async function loginWithDynamicOAuth() {
    try {
        const username = process.env.OAUTH_USERNAME;
        const password = process.env.OAUTH_PASSWORD;

        const result = await clientOAuthDynamic.login(username, password, {
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        });
        console.log('OAuth Login successful!');
        console.log('Token:', result.token);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

// Example 4: Make authenticated requests
async function makeAuthenticatedRequest() {
    await loginWithOAuth();

    // Now you can make authenticated requests
    const nodes = await clientOAuth.getNodes('article');
    console.log('Fetched nodes:', nodes.data?.length || 0);
}

// Run examples
makeAuthenticatedRequest();
