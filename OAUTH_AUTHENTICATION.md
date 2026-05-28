# OAuth Authentication

NodeHive Client now supports OAuth 2.0 authentication alongside the existing JWT authentication method. OAuth is now the default authentication method.

## Configuration

### OAuth Grant Types

The library supports three OAuth 2.0 grant types:

1. **Password Grant** - For user authentication (default, deprecated by OAuth 2.1)
2. **Client Credentials Grant** - For server-to-server / service account authentication
3. **Authorization Code Grant with PKCE** - For SSO via an Identity Provider redirect (recommended for user authentication, OAuth 2.1 compliant)

### OAuth Password Grant (User Authentication)

**Using environment variables (recommended):**

```javascript
import { NodeHiveClient } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        method: 'oauth', // This is the default and can be omitted
        oauth: {
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        }
    }
});
```

**Hardcoded credentials (not recommended for production):**

```javascript
const client = new NodeHiveClient({
    baseUrl: 'https://your-drupal-site.com',
    auth: {
        method: 'oauth', // This is the default and can be omitted
        oauth: {
            clientId: 'your-client-id',
            clientSecret: 'your-client-secret'
        }
    }
});
```

> ⚠️ **Security Best Practice:** Always use environment variables for sensitive credentials. Never commit credentials directly in your code.

### OAuth Client Credentials Grant (Server-to-Server)

For server-to-server authentication, API integrations, service accounts, and background tasks, use the **Client Credentials Grant**:

**Configuration:**

```javascript
import { NodeHiveClient } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'client_credentials', // ← This is the key!
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            scope: 'read write' // Optional
        }
    }
});
```

**Usage:**

```javascript
// No username/password needed!
await client.login(); // Uses client credentials automatically

// Now make requests as a service account
const articles = await client.getNodes('article');
```

**When to use Client Credentials:**
- ✅ Server-to-server communication
- ✅ Background jobs / cron tasks
- ✅ API integrations
- ✅ Service accounts
- ✅ Automated data synchronization

**Key differences from Password Grant:**
- ❌ No username/password required
- ❌ No refresh token (re-authenticate or call `login()` again when expired)
- ✅ Faster authentication (fewer parameters)
- ✅ Better for automated systems
- ✅ Acts as service account, not specific user

### OAuth Authorization Code Grant with PKCE (SSO)

Use this grant for delegating user login to a central Identity Provider (Drupal acting as IdP). The user is redirected to the IdP's `/oauth/authorize` endpoint, signs in there once, and is redirected back to your application with an authorization code. Your application exchanges the code (plus a PKCE `code_verifier`) for an access token + refresh token. Subsequent visits to other frontends sharing the same IdP get silent SSO via the IdP's session cookie — no second password prompt.

The client only ever sees the IdP's redirect URL; credentials never touch the frontend. This is the recommended flow per OAuth 2.1.

**Setup the SDK with `grantType: 'authorization_code'`:**

```javascript
import {
    NodeHiveClient,
    generatePKCE,
    generateState,
    buildAuthorizeUrl
} from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL, // resource server (REST calls)
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'authorization_code',
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            scope: 'frontend',
            authorizeUrl: process.env.OAUTH_AUTHORIZE_URL, // e.g. https://idp/oauth/authorize
            tokenUrl: process.env.OAUTH_TOKEN_URL          // optional, defaults to {baseUrl}/oauth/token
        }
    }
});
```

**Login route — start the redirect:**

```javascript
// e.g. Next.js Route Handler at /api/auth/login
const { codeVerifier, codeChallenge } = await generatePKCE();
const state = generateState();

// Persist codeVerifier + state in an httpOnly cookie (short TTL, e.g. 10 min).
// The same value is required in the callback handler.

const redirectUrl = buildAuthorizeUrl({
    authorizeUrl: process.env.OAUTH_AUTHORIZE_URL,
    clientId: process.env.OAUTH_CLIENT_ID,
    redirectUri: `${origin}/api/auth/callback`,
    scope: 'frontend',
    state,
    codeChallenge
});
// 302 redirect the user to redirectUrl
```

**Callback route — exchange the code for tokens:**

```javascript
// e.g. Next.js Route Handler at /api/auth/callback
// Verify `state` matches the value stored in the cookie, then:

const result = await client.auth.exchangeCode({
    code: searchParams.get('code'),
    codeVerifier: cookieCodeVerifier,
    redirectUri: `${origin}/api/auth/callback`
});

// result.token, result.refresh_token, result.user are now persisted via the
// configured storage adapter. The user's roles are available at
// result.user.roles (same format as Password Grant).
```

**Refresh tokens (silent refresh):**

```javascript
// Trigger from middleware when access token nears expiry
const refreshed = await client.auth.refreshToken();
// refreshed.token and refreshed.refresh_token are rotated; user_details updated.
```

**Multi-domain deployments:** The `redirectUri` is supplied per call instead of statically configured, so the same deployment can serve multiple eTLD+1 hostnames. Register every callback URL in the OAuth client on the IdP.

**Logout:** Call `client.logout()` to clear local credentials. For full revocation, POST the refresh token to the IdP's `/oauth/revoke` endpoint from your server.

### JWT Authentication (Legacy)

```javascript
const client = new NodeHiveClient({
    baseUrl: 'https://your-drupal-site.com',
    auth: {
        method: 'jwt'
    }
});
```

## Usage

### Login with OAuth

```javascript
try {
    const result = await client.login('username', 'password');
    console.log('Access Token:', result.token);
    console.log('Refresh Token:', result.refresh_token);
    console.log('Expires in:', result.expires_in);
    console.log('User Details:', result.user);
} catch (error) {
    console.error('Login failed:', error.message);
}
```

### Login with Dynamic OAuth Credentials

You can also provide OAuth credentials per-request instead of in the configuration:

```javascript
const client = new NodeHiveClient({
    baseUrl: 'https://your-drupal-site.com',
    auth: {
        method: 'oauth'
    }
});

const result = await client.login('username', 'password', {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});
```

### Token Expiration and Automatic Refresh

OAuth tokens typically expire after a certain time (usually 5 minutes / 300 seconds). The NodeHive Client **automatically handles token expiration** for you!

You can also provide persistence hints for cookie-based adapters:

```javascript
const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        method: 'oauth',
        oauth: {
            grantType: 'password',
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET
        },
        session: {
            tokenMaxAge: 3600,          // access token lifetime in seconds
            refreshTokenMaxAge: 60 * 60 * 24 * 30 // refresh token lifetime in seconds
        }
    }
});
```

#### Automatic Token Refresh

When a request fails with a 401 Unauthorized error, the client will:

1. Automatically call `refreshToken()` using the stored refresh token
2. Retry the original request with the new access token
3. Return the result seamlessly (transparent to your code!)

**Example - No special handling needed:**

```javascript
// Just make your requests normally
const articles = await client.getNodes('article');

// If the token expired, the client automatically:
// 1. Detects the 401 error
// 2. Refreshes the token
// 3. Retries the request
// 4. Returns the data (you never know it happened!)
```

#### Manual Token Refresh

You can also manually refresh the token if needed:

```javascript
try {
    const result = await client.refreshToken();
    console.log('New Access Token:', result.token);
    console.log('New Refresh Token:', result.refresh_token);
    console.log('Expires in:', result.expires_in);
} catch (error) {
console.error('Token refresh failed:', error.message);
}
```

```javascript
const expiresAt = await client.auth.getTokenExpiresAt();
console.log('Token expires at:', expiresAt);

if (await client.auth.isTokenExpired()) {
    await client.login(); // or await client.refreshToken();
}
```

#### Handling Expired Refresh Tokens

If both the access token AND refresh token are expired/invalid, you'll need to re-authenticate:

```javascript
try {
    const articles = await client.getNodes('article');
} catch (error) {
    if (error.status === 401) {
        // Both tokens expired, need to re-login
        await client.login(username, password);

        // Retry the request
        const articles = await client.getNodes('article');
    }
}
```

**Note:** Token refresh is only available when using OAuth authentication. Calling `refreshToken()` with JWT authentication will throw an error.

### Logout

```javascript
await client.logout();
// This will clear the access token, refresh token, and user details
```

## Drupal Simple OAuth Configuration

### Enabling Client Credentials Grant

To use Client Credentials Grant with Drupal's Simple OAuth module:

1. **Navigate to OAuth Clients**: `/admin/config/services/consumer`
2. **Edit your OAuth client** (or create a new one)
3. **Enable Grant Types**:
   - Check ✅ **"Client Credentials"** for server-to-server
   - Check ✅ **"Password"** for user authentication (optional)
4. **Save the configuration**

### Creating a Service Account Client

For dedicated service accounts:

1. Create a new OAuth client specifically for server-to-server use
2. Enable **only** "Client Credentials" grant
3. Configure appropriate permissions/roles
4. Store credentials securely in environment variables

### Troubleshooting

**Error: "The request is missing a required parameter"**
- Ensure "Client Credentials" grant is enabled in the OAuth client configuration
- Verify `client_id` and `client_secret` are correct

**Error: "Invalid client or client credentials"**
- Check that the client exists in Drupal
- Verify credentials match exactly

## API Endpoint

The OAuth implementation uses the following endpoint format:

```bash
curl -X POST "https://your-drupal-site.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&username=USERNAME&password=PASSWORD"
```

## Features

### OAuth Authentication
- ✅ Password grant type
- ✅ Access token storage
- ✅ Refresh token support
- ✅ Automatic user details fetching
- ✅ Token refresh method
- ✅ Per-request credential override

### JWT Authentication (Legacy)
- ✅ Basic authentication
- ✅ Token storage
- ✅ User details fetching
- ✅ Session validation

## Comparison

| Feature | OAuth | JWT |
|---------|-------|-----|
| Default Method | ✅ Yes | ❌ No |
| Token Refresh | ✅ Yes | ❌ No |
| Refresh Token | ✅ Yes | ❌ No |
| Expires In | ✅ Yes | ❌ No |
| Client Credentials | ✅ Required | ❌ Not used |

## Migration from JWT to OAuth

If you're currently using JWT authentication and want to migrate to OAuth:

1. **Configure OAuth in your Drupal site** - Ensure the Simple OAuth module is installed and configured
2. **Create OAuth client credentials** - Generate a client ID and client secret
3. **Update your client configuration**:

```javascript
// Before (JWT)
const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        method: 'jwt'
    }
});

// After (OAuth)
const client = new NodeHiveClient({
    baseUrl: 'https://your-site.com',
    auth: {
        // method: 'oauth' is now the default
        oauth: {
            clientId: 'your-client-id',
            clientSecret: 'your-client-secret'
        }
    }
});
```

4. **Update login calls** - The login method signature remains the same, but now returns additional OAuth fields:

```javascript
// The result now includes refresh_token and expires_in
const result = await client.login('username', 'password');
console.log(result.refresh_token); // Available with OAuth
console.log(result.expires_in);    // Available with OAuth
```

5. **Implement token refresh** - Take advantage of the new refresh token capability:

```javascript
// Refresh token before it expires
setInterval(async () => {
    try {
        await client.refreshToken();
        console.log('Token refreshed');
    } catch (error) {
        console.error('Need to re-login');
    }
}, result.expires_in * 1000 - 60000); // Refresh 1 minute before expiry
```

## Backward Compatibility

The library maintains backward compatibility with JWT authentication. Existing code using JWT will continue to work by explicitly setting `auth.method` to `'jwt'`.

However, new projects should use OAuth as it provides better security and token management features.
