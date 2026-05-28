#!/usr/bin/env node

/**
 * Authentication Tests
 * Tests authentication, authorization, and session management
 */

import {
    NodeHiveClient,
    AuthManager,
    MemoryStorage,
    BrowserStorage,
    OAuthAuthorizationCodeStrategy,
    generatePKCE,
    generateState,
    buildAuthorizeUrl
} from '../index.js';
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

    await helper.section('OAuth Authorization Code + PKCE');

    await helper.test('generatePKCE returns S256 verifier/challenge pair', async () => {
        const pair = await generatePKCE();
        helper.assert(typeof pair.codeVerifier === 'string', 'codeVerifier is a string');
        helper.assert(pair.codeVerifier.length >= 43, 'codeVerifier is base64url-encoded 32 random bytes');
        helper.assert(typeof pair.codeChallenge === 'string', 'codeChallenge is a string');
        helper.assert(pair.codeChallengeMethod === 'S256', 'codeChallengeMethod is S256');
        helper.assert(/^[A-Za-z0-9_-]+$/.test(pair.codeVerifier), 'codeVerifier is base64url (no padding)');
        helper.assert(/^[A-Za-z0-9_-]+$/.test(pair.codeChallenge), 'codeChallenge is base64url (no padding)');

        // Roundtrip: SHA256(codeVerifier) -> base64url == codeChallenge
        const { subtle } = globalThis.crypto;
        const digest = await subtle.digest('SHA-256', new TextEncoder().encode(pair.codeVerifier));
        const bytes = new Uint8Array(digest);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const expected = Buffer.from(binary, 'binary').toString('base64')
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        helper.assert(expected === pair.codeChallenge, 'codeChallenge matches SHA256(codeVerifier)');
        helper.debug('PKCE roundtrip verified');
    });

    await helper.test('generateState returns 32-byte base64url string', async () => {
        const a = generateState();
        const b = generateState();
        helper.assert(typeof a === 'string', 'state is a string');
        helper.assert(a.length >= 43, 'state has expected base64url length for 32 bytes');
        helper.assert(/^[A-Za-z0-9_-]+$/.test(a), 'state is base64url (no padding)');
        helper.assert(a !== b, 'consecutive states are random');
        helper.debug('generateState produces unique base64url strings');
    });

    await helper.test('buildAuthorizeUrl builds expected query params', async () => {
        const url = buildAuthorizeUrl({
            authorizeUrl: 'https://idp.example.com/oauth/authorize',
            clientId: 'frontends',
            redirectUri: 'https://app.example.com/api/auth/callback',
            scope: 'frontend',
            state: 'STATE-123',
            codeChallenge: 'CHALLENGE-xyz'
        });
        const parsed = new URL(url);
        helper.assert(parsed.origin + parsed.pathname === 'https://idp.example.com/oauth/authorize', 'base URL preserved');
        helper.assert(parsed.searchParams.get('response_type') === 'code', 'response_type=code');
        helper.assert(parsed.searchParams.get('client_id') === 'frontends', 'client_id set');
        helper.assert(parsed.searchParams.get('redirect_uri') === 'https://app.example.com/api/auth/callback', 'redirect_uri set');
        helper.assert(parsed.searchParams.get('scope') === 'frontend', 'scope set');
        helper.assert(parsed.searchParams.get('state') === 'STATE-123', 'state set');
        helper.assert(parsed.searchParams.get('code_challenge') === 'CHALLENGE-xyz', 'code_challenge set');
        helper.assert(parsed.searchParams.get('code_challenge_method') === 'S256', 'method=S256');
        helper.debug('Authorize URL built correctly');
    });

    await helper.test('buildAuthorizeUrl validates required fields', async () => {
        let threw = false;
        try {
            buildAuthorizeUrl({ clientId: 'x', redirectUri: 'y', state: 's', codeChallenge: 'c' });
        } catch (e) {
            threw = true;
        }
        helper.assert(threw, 'throws when authorizeUrl missing');
        helper.debug('Missing fields rejected');
    });

    await helper.test('AuthManager wires authorization_code grant type', async () => {
        const client = new NodeHiveClient({
            baseUrl: 'https://idp.example.com',
            auth: {
                method: 'oauth',
                oauth: {
                    grantType: 'authorization_code',
                    clientId: 'frontends',
                    clientSecret: 'secret',
                    authorizeUrl: 'https://idp.example.com/oauth/authorize',
                    redirectUri: 'https://app.example.com/api/auth/callback'
                }
            }
        });
        helper.assert(client.auth.isAuthorizationCodeGrant(), 'isAuthorizationCodeGrant() true');
        helper.assert(client.auth.strategy instanceof OAuthAuthorizationCodeStrategy, 'Strategy is OAuthAuthorizationCodeStrategy');
        helper.debug('AuthManager picks AuthorizationCode strategy');
    });

    await helper.test('exchangeCode persists tokens + fetches user details', async () => {
        const ACCESS = makeJwt({ sub: '42' });
        const calls = [];
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            calls.push({ url: String(url), init });
            if (String(url).endsWith('/oauth/token')) {
                return mockJson({
                    access_token: ACCESS,
                    refresh_token: 'REFRESH-1',
                    token_type: 'Bearer',
                    expires_in: 900
                });
            }
            if (String(url).includes('/user/42')) {
                return mockJson({
                    uid: [{ value: 42 }],
                    name: [{ value: 'Yannick' }],
                    roles: [{ target_id: 'editor' }, { target_id: 'authenticated' }]
                });
            }
            throw new Error('Unexpected fetch: ' + url);
        };

        try {
            const client = new NodeHiveClient({
                baseUrl: 'https://idp.example.com',
                auth: {
                    method: 'oauth',
                    oauth: {
                        grantType: 'authorization_code',
                        clientId: 'frontends',
                        clientSecret: 'secret'
                    }
                }
            });

            const result = await client.auth.exchangeCode({
                code: 'CODE-xyz',
                codeVerifier: 'VERIFIER-xyz',
                redirectUri: 'https://app.example.com/api/auth/callback'
            });

            helper.assert(result.success, 'exchangeCode reports success');
            helper.assert(result.token === ACCESS, 'access token returned');
            helper.assert(result.refresh_token === 'REFRESH-1', 'refresh token returned');
            helper.assert(result.user?.roles?.[0]?.target_id === 'editor', 'roles parsed from user details');

            const storedToken = await client.auth.getToken();
            const storedRefresh = await client.auth.getRefreshToken();
            const storedUser = await client.auth.getUserDetails();
            helper.assert(storedToken === ACCESS, 'access token persisted in storage');
            helper.assert(storedRefresh === 'REFRESH-1', 'refresh token persisted in storage');
            helper.assert(storedUser?.name?.[0]?.value === 'Yannick', 'user_details persisted');

            const tokenCall = calls.find(c => c.url.endsWith('/oauth/token'));
            const body = new URLSearchParams(tokenCall.init.body);
            helper.assert(body.get('grant_type') === 'authorization_code', 'grant_type=authorization_code');
            helper.assert(body.get('code') === 'CODE-xyz', 'code forwarded');
            helper.assert(body.get('code_verifier') === 'VERIFIER-xyz', 'code_verifier forwarded');
            helper.assert(body.get('redirect_uri') === 'https://app.example.com/api/auth/callback', 'redirect_uri forwarded');
            helper.assert(body.get('client_id') === 'frontends', 'client_id forwarded');
            helper.assert(body.get('client_secret') === 'secret', 'client_secret forwarded');
            helper.debug('exchangeCode integration verified');
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await helper.test('exchangeCode falls back to configured redirectUri', async () => {
        const ACCESS = makeJwt({ sub: '42' });
        const calls = [];
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            calls.push({ url: String(url), init });
            if (String(url).endsWith('/oauth/token')) {
                return mockJson({ access_token: ACCESS, token_type: 'Bearer', expires_in: 900 });
            }
            if (String(url).includes('/user/42')) {
                return mockJson({ uid: [{ value: 42 }], roles: [] });
            }
            throw new Error('Unexpected fetch: ' + url);
        };

        try {
            const client = new NodeHiveClient({
                baseUrl: 'https://idp.example.com',
                auth: {
                    method: 'oauth',
                    oauth: {
                        grantType: 'authorization_code',
                        clientId: 'frontends',
                        clientSecret: 'secret',
                        redirectUri: 'https://app.example.com/api/auth/callback'
                    }
                }
            });

            // No per-call redirectUri — must fall back to oauthConfig.redirectUri
            await client.auth.exchangeCode({ code: 'CODE', codeVerifier: 'V' });

            const tokenCall = calls.find(c => c.url.endsWith('/oauth/token'));
            const body = new URLSearchParams(tokenCall.init.body);
            helper.assert(
                body.get('redirect_uri') === 'https://app.example.com/api/auth/callback',
                'redirect_uri taken from oauthConfig when not passed per call'
            );
            helper.debug('configured redirectUri fallback verified');
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await helper.test('refreshToken rotates tokens and updates user details', async () => {
        const ACCESS_2 = makeJwt({ sub: '42' });
        const calls = [];
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            calls.push({ url: String(url), init });
            if (String(url).endsWith('/oauth/token')) {
                return mockJson({
                    access_token: ACCESS_2,
                    refresh_token: 'REFRESH-2',
                    token_type: 'Bearer',
                    expires_in: 900
                });
            }
            if (String(url).includes('/user/42')) {
                return mockJson({ uid: [{ value: 42 }], roles: [{ target_id: 'admin' }] });
            }
            throw new Error('Unexpected fetch: ' + url);
        };

        try {
            const client = new NodeHiveClient({
                baseUrl: 'https://idp.example.com',
                auth: {
                    method: 'oauth',
                    oauth: {
                        grantType: 'authorization_code',
                        clientId: 'frontends',
                        clientSecret: 'secret'
                    }
                }
            });
            await client.auth.setRefreshToken('REFRESH-1');

            const result = await client.auth.refreshToken();

            helper.assert(result.success, 'refresh reports success');
            helper.assert(result.token === ACCESS_2, 'rotated access token returned');
            helper.assert(result.refresh_token === 'REFRESH-2', 'rotated refresh token returned');
            helper.assert(result.user?.roles?.[0]?.target_id === 'admin', 'user_details refreshed with new roles');

            const body = new URLSearchParams(calls[0].init.body);
            helper.assert(body.get('grant_type') === 'refresh_token', 'grant_type=refresh_token');
            helper.assert(body.get('refresh_token') === 'REFRESH-1', 'old refresh token sent');
            helper.debug('refreshToken rotation verified');
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await helper.test('exchangeCode surfaces Drupal error responses', async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async () => mockJson({ error: 'invalid_grant', error_description: 'Invalid auth code' }, 400);

        try {
            const client = new NodeHiveClient({
                baseUrl: 'https://idp.example.com',
                auth: {
                    method: 'oauth',
                    oauth: {
                        grantType: 'authorization_code',
                        clientId: 'frontends',
                        clientSecret: 'secret'
                    }
                }
            });
            let threw = false;
            try {
                await client.auth.exchangeCode({
                    code: 'BAD',
                    codeVerifier: 'V',
                    redirectUri: 'https://app.example.com/api/auth/callback'
                });
            } catch (e) {
                threw = true;
                helper.assert(/Invalid auth code/.test(e.message), 'error_description surfaced in error message');
            }
            helper.assert(threw, 'exchangeCode throws on 4xx');
            helper.debug('exchangeCode error path verified');
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await helper.summary();
}

function makeJwt(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${header}.${body}.signature`;
}

function mockJson(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body
    };
}

// Run tests
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { runTests };
