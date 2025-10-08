/**
 * TypeScript Example - NodeHive Authentication
 *
 * This example demonstrates how to use NodeHiveClient with TypeScript
 * and proper type definitions for all authentication methods.
 */

import { NodeHiveClient } from '../package/index.js';
import type {
    AuthOptions,
    OAuthConfig,
    LoginOptions,
    LoginResult,
    ApiResponse
} from '../package/types.js';

// ============================================================
// Example 1: NodeHive API Key (Recommended - Simplest)
// ============================================================

// Type-safe configuration for API Key authentication
const apiKeyAuth: AuthOptions = {
    apiKey: 'nhk_your_api_key_here'
};

const clientWithApiKey = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: apiKeyAuth
});

// No login needed - already authenticated!
async function useApiKey() {
    const isLoggedIn: boolean = await clientWithApiKey.isLoggedIn();
    console.log('Authenticated:', isLoggedIn); // true

    const articles: ApiResponse = await clientWithApiKey.getNodes('article');
    console.log('Fetched articles:', articles.data?.length);
}

// ============================================================
// Example 2: OAuth Password Grant (User Authentication)
// ============================================================

// Type-safe OAuth configuration
const oauthPasswordConfig: AuthOptions = {
    method: 'oauth',
    oauth: {
        grantType: 'password',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret'
    }
};

const clientWithOAuth = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: oauthPasswordConfig
});

async function useOAuthPassword() {
    // Login with username and password
    const result: LoginResult = await clientWithOAuth.login(
        'username',
        'password'
    );

    console.log('Login success:', result.success);
    console.log('Token:', result.token);
    console.log('Expires in:', result.expires_in); // OAuth specific
    console.log('User:', result.user);

    // Make authenticated requests
    const articles: ApiResponse = await clientWithOAuth.getNodes('article');
    console.log('Fetched articles:', articles.data?.length);
}

// ============================================================
// Example 3: OAuth Client Credentials (Service Account)
// ============================================================

// Type-safe OAuth Client Credentials configuration
const oauthClientConfig: AuthOptions = {
    method: 'oauth',
    oauth: {
        grantType: 'client_credentials',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret',
        scope: 'optional-scope'
    }
};

const clientWithClientCreds = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: oauthClientConfig
});

async function useOAuthClientCredentials() {
    // Login without username/password (service account)
    const result: LoginResult = await clientWithClientCreds.login();

    console.log('Login success:', result.success);
    console.log('Token:', result.token);
    console.log('Token type:', result.token_type); // 'Bearer'
    console.log('Scope:', result.scope);

    // Make authenticated requests
    const articles: ApiResponse = await clientWithClientCreds.getNodes('article');
    console.log('Fetched articles:', articles.data?.length);
}

// ============================================================
// Example 4: JWT Authentication (Legacy)
// ============================================================

const jwtConfig: AuthOptions = {
    method: 'jwt'
};

const clientWithJWT = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: jwtConfig
});

async function useJWT() {
    const result: LoginResult = await clientWithJWT.login(
        'user@example.com',
        'password'
    );

    console.log('JWT Login success:', result.success);
    console.log('JWT Token:', result.token);
}

// ============================================================
// Example 5: No Authentication (Public Access)
// ============================================================

const publicClient = new NodeHiveClient({
    baseUrl: 'https://your-site.com'
    // No auth configuration
});

async function usePublicAccess() {
    // Access public content only
    const articles: ApiResponse = await publicClient.getNodes('article', {
        params: {
            'filter[status]': 1 // Published only
        }
    });
    console.log('Public articles:', articles.data?.length);
}

// ============================================================
// Example 6: Runtime Configuration with LoginOptions
// ============================================================

const flexibleClient = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        method: 'oauth',
        oauth: {
            clientId: 'default-client-id',
            clientSecret: 'default-client-secret'
        }
    }
});

async function runtimeConfiguration() {
    // Override OAuth config at login time
    const loginOptions: LoginOptions = {
        grantType: 'client_credentials',
        clientId: 'override-client-id',
        clientSecret: 'override-client-secret',
        scope: 'custom-scope'
    };

    const result: LoginResult = await flexibleClient.login(undefined, undefined, loginOptions);
    console.log('Flexible login:', result.success);
}

// ============================================================
// Example 7: Type-Safe API Responses
// ============================================================

interface Article {
    id: string;
    type: string;
    attributes: {
        title: string;
        body?: {
            value: string;
            format: string;
        };
        created: string;
        status: boolean;
    };
}

async function typeSafeApiCalls() {
    const client = new NodeHiveClient({
        baseUrl: 'https://your-site.com',
        auth: { apiKey: 'nhk_your_key' }
    });

    // Type-safe response
    const response: ApiResponse<Article[]> = await client.getNodes('article');

    if (response.data) {
        response.data.forEach((article: Article) => {
            console.log('Title:', article.attributes.title);
            console.log('Status:', article.attributes.status);
        });
    }
}

// ============================================================
// Example 8: Complete Authentication Flow with Error Handling
// ============================================================

async function completeAuthFlow() {
    try {
        const client = new NodeHiveClient({
            baseUrl: 'https://your-site.com',
            auth: {
                method: 'oauth',
                oauth: {
                    grantType: 'password',
                    clientId: process.env.OAUTH_CLIENT_ID!,
                    clientSecret: process.env.OAUTH_CLIENT_SECRET!
                }
            }
        });

        // Check if already logged in
        const isLoggedIn: boolean = await client.isLoggedIn();
        if (!isLoggedIn) {
            // Login
            const result: LoginResult = await client.login(
                process.env.USERNAME!,
                process.env.PASSWORD!
            );

            if (result.success) {
                console.log('✓ Logged in successfully');
                console.log('  Token expires in:', result.expires_in, 'seconds');
            }
        }

        // Verify session
        const hasValidSession: boolean = await client.hasValidSession();
        console.log('Valid session:', hasValidSession);

        // Get user details
        const user = await client.getUserDetails();
        console.log('User:', user?.email);

        // Make API calls
        const articles: ApiResponse = await client.getNodes('article');
        console.log('Fetched', articles.data?.length, 'articles');

        // Logout
        await client.logout();
        console.log('✓ Logged out');

    } catch (error) {
        console.error('Authentication error:', error);
    }
}

// ============================================================
// Example 9: Custom Storage Adapter
// ============================================================

import type { StorageAdapter } from '../package/types.js';

class CustomStorage implements StorageAdapter {
    private data: Map<string, string> = new Map();

    async get(key: string): Promise<string | null> {
        return this.data.get(key) || null;
    }

    async set(key: string, value: string): Promise<void> {
        this.data.set(key, value);
    }

    async remove(key: string): Promise<void> {
        this.data.delete(key);
    }
}

const clientWithCustomStorage = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        apiKey: 'nhk_your_key',
        storage: {
            type: 'custom',
            adapter: new CustomStorage()
        }
    }
});

// ============================================================
// Example 10: All Configuration Options
// ============================================================

import type { NodeHiveOptions } from '../package/types.js';

const completeConfig: NodeHiveOptions = {
    baseUrl: 'https://your-site.com',
    debug: true,
    defaultLanguage: 'en',
    timeout: 30000,

    // Authentication
    auth: {
        method: 'nodehive-api-key',
        apiKey: process.env.NODEHIVE_API_KEY,
        storage: {
            type: 'memory'
        }
    },

    // Entity configuration
    config: {
        entities: {
            'node--article': {
                addFields: ['title', 'body', 'created'],
                addInclude: ['field_image', 'uid']
            }
        }
    },

    // Cache configuration
    cache: {
        enabled: true,
        ttl: 3600
    },

    // Retry configuration
    retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000
    }
};

const fullyConfiguredClient = new NodeHiveClient(completeConfig);

// ============================================================
// Export Examples
// ============================================================

export {
    useApiKey,
    useOAuthPassword,
    useOAuthClientCredentials,
    useJWT,
    usePublicAccess,
    runtimeConfiguration,
    typeSafeApiCalls,
    completeAuthFlow
};
