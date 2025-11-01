# TypeScript Support

NodeHive JS Client includes comprehensive TypeScript type definitions for a fully type-safe development experience.

## Installation

The package includes type definitions out of the box. No additional `@types` package is needed.

```bash
npm install nodehive-js
```

## Authentication Types

### AuthOptions

Complete authentication configuration with support for multiple methods:

```typescript
import { NodeHiveClient, AuthOptions } from 'nodehive-js';

// Method 1: NodeHive API Key (Recommended)
const apiKeyAuth: AuthOptions = {
    apiKey: 'nhk_your_api_key_here'
};

// Method 2: OAuth Password Grant
const oauthPasswordAuth: AuthOptions = {
    method: 'oauth',
    oauth: {
        grantType: 'password',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret'
    }
};

// Method 3: OAuth Client Credentials
const oauthClientAuth: AuthOptions = {
    method: 'oauth',
    oauth: {
        grantType: 'client_credentials',
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret',
        scope: 'optional-scope'
    },
    session: {
        tokenMaxAge: 3600,
        refreshTokenMaxAge: 60 * 60 * 24 * 30
    }
};

// Method 4: JWT (Legacy)
const jwtAuth: AuthOptions = {
    method: 'jwt'
};
```

### OAuthConfig

OAuth 2.0 configuration options:

```typescript
import { OAuthConfig } from 'nodehive-js';

const oauthConfig: OAuthConfig = {
    grantType: 'password', // or 'client_credentials'
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    scope: 'optional-scope' // Optional
};
```

### LoginOptions

Runtime login configuration overrides:

```typescript
import { LoginOptions } from 'nodehive-js';

const loginOptions: LoginOptions = {
    grantType: 'client_credentials',
    clientId: 'override-client-id',
    clientSecret: 'override-client-secret',
    scope: 'custom-scope',
    tokenMaxAge: 900,
    refreshTokenMaxAge: 3600
};

// Username/password are optional when using the client credentials grant
await client.login(undefined, undefined, loginOptions);
```

### LoginResult

Authentication result with method-specific properties:

```typescript
import { LoginResult } from 'nodehive-js';

const result: LoginResult = await client.login('user', 'pass');

console.log(result.success);        // boolean
console.log(result.token);          // string
console.log(result.method);         // 'nodehive-api-key' | 'oauth' | 'jwt'
console.log(result.user);           // User details (optional)
console.log(result.refresh_token);  // OAuth only
console.log(result.expires_in);     // OAuth only
console.log(result.token_type);     // 'Bearer'
console.log(result.scope);          // OAuth scope
```

## Complete Configuration

### NodeHiveOptions

Full client configuration with all options:

```typescript
import { NodeHiveOptions } from 'nodehive-js';

const config: NodeHiveOptions = {
    baseUrl: 'https://your-site.com',
    debug: true,
    defaultLanguage: 'en',
    timeout: 30000,

    // Authentication
    auth: {
        method: 'nodehive-api-key',
        apiKey: 'nhk_your_key',
        session: {
            tokenMaxAge: 3600,
            refreshTokenMaxAge: 60 * 60 * 24 * 30
        },
        storage: {
            type: 'memory' // or 'localStorage', 'sessionStorage', 'cookie', 'custom'
        }
    },

    // Entity configuration
    config: {
        entities: {
            'node--article': {
                addFields: ['title', 'body'],
                addInclude: ['field_image']
            }
        }
    },

    // Cache
    cache: {
        enabled: true,
        ttl: 3600
    },

    // Retry
    retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000
    }
};

const client = new NodeHiveClient(config);
```

## API Response Types

### ApiResponse

Type-safe API responses:

```typescript
import { ApiResponse } from 'nodehive-js';

// Generic response
const response: ApiResponse = await client.getNodes('article');

// Typed response with custom interface
interface Article {
    id: string;
    type: string;
    attributes: {
        title: string;
        body?: { value: string };
        created: string;
    };
}

const typedResponse: ApiResponse<Article[]> = await client.getNodes('article');

if (typedResponse.data) {
    typedResponse.data.forEach(article => {
        console.log(article.attributes.title); // Type-safe!
    });
}
```

## Storage Adapters

### Custom Storage Adapter

Implement your own storage with type safety:

```typescript
import { StorageAdapter } from 'nodehive-js';

class CustomStorage implements StorageAdapter {
    async get(key: string): Promise<string | null> {
        // Your implementation
        return null;
    }

    async set(key: string, value: string): Promise<void> {
        // Your implementation
    }

    async remove(key: string): Promise<void> {
        // Your implementation
    }
}

const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        storage: {
            type: 'custom',
            adapter: new CustomStorage()
        }
    }
});
```

## Error Types

Type-safe error handling:

```typescript
import {
    NodeHiveError,
    NetworkError,
    AuthenticationError,
    ValidationError,
    ConfigurationError
} from 'nodehive-js';

try {
    await client.getNodes('article');
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.error('Authentication failed:', error.message);
    } else if (error instanceof NetworkError) {
        console.error('Network error:', error.status, error.url);
    } else if (error instanceof ValidationError) {
        console.error('Validation error:', error.field, error.value);
    } else if (error instanceof ConfigurationError) {
        console.error('Configuration error:', error.message);
    }
}
```

## Examples

### Example 1: API Key Authentication

```typescript
import { NodeHiveClient, AuthOptions, ApiResponse } from 'nodehive-js';

const auth: AuthOptions = {
    apiKey: process.env.NODEHIVE_API_KEY
};

const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth
});

// Already authenticated - no login needed
const articles: ApiResponse = await client.getNodes('article');
```

### Example 2: OAuth with Type Safety

```typescript
import { NodeHiveClient, LoginResult, UserDetails } from 'nodehive-js';

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

const result: LoginResult = await client.login('user', 'password');

if (result.success) {
    const user: UserDetails | null = await client.getUserDetails();
    console.log('Logged in as:', user?.email);
}
```

### Example 3: Client Credentials

```typescript
import { NodeHiveClient, LoginOptions } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'client_credentials',
            clientId: process.env.CLIENT_ID!,
            clientSecret: process.env.CLIENT_SECRET!
        }
    }
});

// Service account login - no username/password
await client.login();

// Make authenticated requests
const articles = await client.getNodes('article');
```

### Example 4: Runtime Configuration

```typescript
import { NodeHiveClient, LoginOptions } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: { method: 'oauth' }
});

// Override config at runtime
const loginOpts: LoginOptions = {
    grantType: 'client_credentials',
    clientId: 'runtime-client',
    clientSecret: 'runtime-secret'
};

await client.login(undefined, undefined, loginOpts);
```

## Available Types

All exported types:

```typescript
import {
    // Main client
    NodeHiveClient,
    NodeHiveOptions,
    NodeHiveConfig,

    // Authentication
    AuthOptions,
    AuthManager,
    OAuthConfig,
    LoginOptions,
    LoginResult,
    UserDetails,

    // Storage
    StorageAdapter,
    StorageOptions,
    MemoryStorage,
    BrowserStorage,
    CookieStorage,
    CookieOptions,

    // Requests & Responses
    RequestOptions,
    ApiResponse,
    RedirectData,

    // Errors
    NodeHiveError,
    NetworkError,
    AuthenticationError,
    ValidationError,
    ConfigurationError
} from 'nodehive-js';
```

## Type Inference

The client supports full type inference:

```typescript
const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        apiKey: 'nhk_key' // Type automatically inferred as AuthOptions
    }
});

// Return type automatically inferred
const articles = await client.getNodes('article'); // ApiResponse

// Parameters are type-checked
await client.login('user', 'pass'); // ✓ Valid
await client.login(123, 456);       // ✗ Type error
```

## Best Practices

1. **Use `AuthOptions` for configuration:**
   ```typescript
   const auth: AuthOptions = { apiKey: 'nhk_key' };
   ```

2. **Type API responses when possible:**
   ```typescript
   const response: ApiResponse<Article[]> = await client.getNodes('article');
   ```

3. **Handle errors with type guards:**
   ```typescript
   if (error instanceof AuthenticationError) { /* ... */ }
   ```

4. **Use environment variables with type assertions:**
   ```typescript
   apiKey: process.env.NODEHIVE_API_KEY!
   ```

5. **Implement custom storage with `StorageAdapter`:**
   ```typescript
   class MyStorage implements StorageAdapter { /* ... */ }
   ```

## IDE Support

TypeScript definitions provide:

- ✅ **IntelliSense** - Auto-completion for all methods and properties
- ✅ **Type Checking** - Compile-time error detection
- ✅ **Documentation** - Inline JSDoc comments in your IDE
- ✅ **Refactoring** - Safe renaming and code navigation
- ✅ **Error Prevention** - Catch mistakes before runtime

## See Also

- [Authentication Guide](./OAUTH_AUTHENTICATION.md)
- [API Key Guide](./NODEHIVE_API_KEY.md)
- [Examples](../examples/)
