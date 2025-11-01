# NodeHive JS Examples

This directory contains example implementations showing how to use the NodeHive JS client library.

## Setup

1. **Copy the environment variables template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your credentials:**
   ```bash
   # Drupal/NodeHive Configuration
   DRUPAL_BASE_URL=https://your-site.com

   # OAuth 2.0 Credentials
   OAUTH_CLIENT_ID=your-client-id
   OAUTH_CLIENT_SECRET=your-client-secret
   OAUTH_USERNAME=your-username
   OAUTH_PASSWORD=your-password

   # JWT Authentication (Legacy)
   JWT_EMAIL=user@example.com
   JWT_PASSWORD=your-password
   ```

3. **Install dependencies:**
   ```bash
   npm install dotenv
   ```

## Examples

### nodehive-api-key.js ⭐ RECOMMENDED

Demonstrates NodeHive API Key authentication (simplest method):

- **One-line configuration** - just set the API key
- **No login required** - start making requests immediately
- **No token expiration** - works forever
- **Perfect for server-to-server** communication
- **Production best practices**
- **Comparison with other methods**
- **Error handling** patterns
- **Configuration styles**

**Run the example:**
```bash
node nodehive-api-key.js
# or
npm run nodehive-api-key
```

**When to use this:**
- ✅ Server-to-server communication (most common)
- ✅ Headless CMS / API integrations
- ✅ Mobile app backends
- ✅ Background jobs and cron tasks
- ✅ Any scenario with public content

### oauth-authentication.js

Demonstrates OAuth 2.0 authentication (the default and recommended method):

- **OAuth authentication** with configured credentials
- **Token refresh** functionality
- **Dynamic OAuth credentials** (per-request override)
- **JWT authentication** comparison
- **Making authenticated requests**

**Run the example:**
```bash
node oauth-authentication.js
# or
npm run oauth
```

### jwt-authentication.js

Demonstrates JWT authentication (legacy method):

- **Basic JWT login** flow
- **Login state management** (isLoggedIn, getToken)
- **Session validation** (hasValidSession)
- **User details** retrieval
- **Pre-configured token** usage
- **Storage adapters** (memory, localStorage, sessionStorage, cookie)
- **Making authenticated requests**
- **Logout** functionality

**Run the example:**
```bash
node jwt-authentication.js
# or
npm run jwt
```

### oauth-token-expiration.js

Demonstrates OAuth token expiration and automatic refresh:

- **Token lifecycle** explanation
- **Manual token refresh** (calling refreshToken())
- **Automatic token refresh** on 401 errors (transparent to your code!)
- **Expired refresh token** handling
- **Best practices** for token management
- **Error handling** patterns

**Run the example:**
```bash
node oauth-token-expiration.js
# or
npm run oauth-expiration
```

### oauth-client-credentials.js

Demonstrates OAuth Client Credentials Grant for server-to-server authentication:

- **No username/password required** - perfect for service accounts
- **Basic client credentials** setup
- **Making API requests** as a service account
- **Scope-based authentication** (optional)
- **Token caching strategies** for performance
- **Expiry helpers** (`auth.getTokenExpiresAt()`, `auth.isTokenExpired()`)
- **Best practices** for server-to-server auth
- **Comparison** between Password Grant and Client Credentials

**Run the example:**
```bash
node oauth-client-credentials.js
# or
npm run oauth-service
```

**When to use this:**
- ✅ Server-to-server communication
- ✅ Background jobs and cron tasks
- ✅ API integrations
- ✅ Service accounts
- ✅ Automated systems

## Security Notes

⚠️ **Never commit your `.env` file to version control!**

The `.env` file is already included in `.gitignore` to prevent accidental commits of sensitive credentials.

## Getting OAuth Credentials

To use OAuth authentication with your Drupal site:

1. Install and enable the **Simple OAuth** module in Drupal
2. Navigate to `/admin/config/people/simple_oauth`
3. Generate OAuth keys if not already done
4. Create an OAuth client at `/admin/config/services/consumer`
5. Note the Client ID and Client Secret for your `.env` file

## Documentation

For more information about authentication options, see:
- [OAUTH_AUTHENTICATION.md](../OAUTH_AUTHENTICATION.md) - Complete OAuth documentation
- [README.md](../README.md) - Main project README
