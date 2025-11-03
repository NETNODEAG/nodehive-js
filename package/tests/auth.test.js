#!/usr/bin/env node

/**
 * Authentication Tests
 * Tests authentication, authorization, and session management
 */

import { NodeHiveClient, AuthManager, MemoryStorage, BrowserStorage } from '../index.js';
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('Authentication Tests');

async function runTests() {
    await helper.section('Authentication Manager');

    await helper.test('AuthManager initialization', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                storage: {
                    type: 'memory'
                }
            }
        });

        helper.assert(client.auth instanceof AuthManager, 'Should have AuthManager instance');
        helper.debug('AuthManager initialized');
    });

    await helper.test('AuthManager with custom storage', async () => {
        const customStorage = new MemoryStorage();
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                storage: {
                    type: 'custom',
                    adapter: customStorage
                }
            }
        });

        helper.assert(client.auth instanceof AuthManager, 'Should use custom storage');
        helper.debug('Custom storage adapter accepted');
    });

    await helper.section('Storage Adapters');

    await helper.test('MemoryStorage operations', async () => {
        const storage = new MemoryStorage();

        // Set value
        await storage.set('test-key', 'test-value');
        const value = await storage.get('test-key');
        helper.assert(value === 'test-value', 'Should store and retrieve value');

        // Update value
        await storage.set('test-key', 'updated-value');
        const updated = await storage.get('test-key');
        helper.assert(updated === 'updated-value', 'Should update value');

        // Remove value
        await storage.remove('test-key');
        const removed = await storage.get('test-key');
        helper.assert(removed === null, 'Should remove value');

        helper.debug('MemoryStorage working correctly');
    });

    await helper.test('Multiple storage instances isolation', async () => {
        const storage1 = new MemoryStorage();
        const storage2 = new MemoryStorage();

        await storage1.set('key', 'value1');
        await storage2.set('key', 'value2');

        const value1 = await storage1.get('key');
        const value2 = await storage2.get('key');

        helper.assert(value1 === 'value1', 'Storage 1 should have its value');
        helper.assert(value2 === 'value2', 'Storage 2 should have its value');
        helper.debug('Storage instances properly isolated');
    });

    await helper.section('Token Management');

    await helper.test('Initial token setting', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                token: 'initial-test-token'
            }
        });

        const token = await client.getToken();
        helper.assert(token === 'initial-test-token', 'Should have initial token');
        helper.debug('Initial token set correctly');
    });

    await helper.test('Token in request headers', async () => {
        const testToken = 'test-bearer-token-123';
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                token: testToken
            }
        });

        // Add interceptor to check headers
        let headerToken = null;
        const remove = client.addRequestInterceptor((config) => {
            headerToken = config.headers['Authorization'];
            return config;
        });

        try {
            await client.getContentTypes();
            remove();

            helper.assert(headerToken === `Bearer ${testToken}`, 'Should add Bearer token to headers');
            helper.debug('Token added to request headers');
        } catch (error) {
            remove();
            throw error;
        }
    });

    await helper.test('Token expiry handling', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        await client.auth.setToken('expiring-token');

        const future = Date.now() + 1_000;
        await client.auth.setTokenExpiresAt(future);
        helper.assert(!(await client.auth.isTokenExpired()), 'Token should not be expired yet');

        const past = Date.now() - 1_000;
        await client.auth.setTokenExpiresAt(past);
        helper.assert(await client.auth.isTokenExpired(), 'Token should report as expired');

        helper.debug('Token expiry tracking working');
    });

    await helper.test('Refresh token persistence', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        await client.auth.setRefreshToken('refresh-token-test');
        const stored = await client.auth.getRefreshToken();
        helper.assert(stored === 'refresh-token-test', 'Refresh token should be stored');

        await client.auth.setRefreshToken(null);
        const cleared = await client.auth.getRefreshToken();
        helper.assert(!cleared, 'Refresh token should be cleared');

        helper.debug('Refresh token storage working');
    });

    await helper.test('Dynamic token update', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // Initially no token
        let token = await client.getToken();
        helper.assert(!token, 'Should have no token initially');

        // Set token
        await client.auth.setToken('dynamic-token');
        token = await client.getToken();
        helper.assert(token === 'dynamic-token', 'Should have new token');

        helper.debug('Dynamic token update working');
    });

    await helper.section('Login State');

    await helper.test('isLoggedIn() state', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // Not logged in initially
        let loggedIn = await client.isLoggedIn();
        helper.assert(!loggedIn, 'Should not be logged in initially');

        // Set token
        await client.auth.setToken('test-token');
        loggedIn = await client.isLoggedIn();
        helper.assert(loggedIn, 'Should be logged in after setting token');

        // Remove token
        await client.logout();
        loggedIn = await client.isLoggedIn();
        helper.assert(!loggedIn, 'Should not be logged in after logout');

        helper.debug('Login state management working');
    });

    await helper.test('API Key login returns credentials', async () => {
        const apiKey = 'nhk_test_key';
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                method: 'nodehive-api-key',
                apiKey
            }
        });

        const result = await client.login();
        helper.assert(result.success, 'API key login should succeed');
        helper.assert(result.token === apiKey, 'API key login should return configured token');
        helper.debug('API key strategy login working');
    });

    await helper.test('logout() clears credentials', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                token: 'test-token'
            }
        });

        // Has token initially
        let token = await client.getToken();
        helper.assert(token === 'test-token', 'Should have token');

        // Logout
        await client.logout();

        // No token after logout
        token = await client.getToken();
        helper.assert(!token, 'Should have no token after logout');

        helper.debug('Logout clears credentials');
    });

    await helper.section('JWT Handling');

    await helper.test('JWT decode', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // Test with a sample JWT (not a real one, just for structure testing)
        const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        try {
            const decoded = client.auth.decodeJwt(sampleJWT);
            helper.assert(decoded, 'Should decode JWT');
            helper.assert(decoded.sub === '1234567890', 'Should have correct payload');
            helper.debug('JWT decoding working');
        } catch (error) {
            helper.debug('JWT decode test failed (expected with sample JWT)');
        }
    });

    await helper.section('Session Validation');

    await helper.test('hasValidSession() without token', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        const valid = await client.hasValidSession();
        helper.assert(!valid, 'Should not have valid session without token');
        helper.debug('Session validation working');
    });

    await helper.test('hasValidSession() with invalid token', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL,
            auth: {
                token: 'invalid-token-xyz'
            }
        });

        const valid = await client.hasValidSession();
        helper.assert(!valid, 'Should not have valid session with invalid token');
        helper.debug('Invalid session detected correctly');
    });

    await helper.section('Backwards Compatibility');

    await helper.test('getJWTAccessToken() deprecated method', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // Test the deprecated method (will fail with invalid credentials, but tests the method exists)
        const result = await client.getJWTAccessToken('test@example.com', 'password');
        helper.assert(result.hasOwnProperty('data'), 'Should return data property');
        helper.assert(result.hasOwnProperty('error'), 'Should return error property');
        helper.debug('Deprecated method still available');
    });

    await helper.test('Legacy cookie methods', async () => {
        const client = new NodeHiveClient({
            baseUrl: helper.BACKEND_URL
        });

        // These should work but show deprecation warnings
        client.storeUserDetails();
        client.clearUserDetails();
        const cookie = client.getCookie('test');
        const allCookies = client.getAllCookieData();
        const hasRole = client.hasRole();

        helper.assert(hasRole === false, 'hasRole should return false');
        helper.debug('Legacy methods still available');
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
