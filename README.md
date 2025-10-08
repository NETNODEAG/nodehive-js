# NodeHive JS Client

A JavaScript client library for interacting with NodeHive/Drupal JSON:API with support for OAuth 2.0 and JWT authentication.

## Features

- **NodeHive API Key** ⭐ - Simplest authentication (recommended)
- **OAuth 2.0 Authentication** - Secure authentication with token refresh support
- **JWT Authentication** (legacy) - Traditional JWT-based authentication
- Full JSON:API support for Drupal
- Configurable storage adapters (memory, localStorage, sessionStorage, cookies)
- Request/response interceptors
- Automatic retry logic
- TypeScript-friendly

## Authentication

The library supports multiple authentication methods. **NodeHive API Key is the simplest and recommended method for most use cases.**

### Authentication Methods

1. **NodeHive API Key** ⭐ RECOMMENDED - Simplest method
2. **OAuth 2.0** - Standard OAuth flows (Password Grant, Client Credentials)
3. **JWT** - Legacy method

### Quick Start with API Key (Recommended)

```javascript
import { NodeHiveClient } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: 'https://your-drupal-site.com',
    auth: {
        apiKey: process.env.NODEHIVE_API_KEY
    }
});

// That's it! No login needed - start making requests immediately
const articles = await client.getNodes('article');
```

### Quick Start with OAuth

```javascript
import { NodeHiveClient } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: 'https://your-drupal-site.com',
    auth: {
        oauth: {
            clientId: 'your-client-id',
            clientSecret: 'your-client-secret'
        }
    }
});

// Login
const result = await client.login('username', 'password');

// Use the client for authenticated requests
const nodes = await client.getNodes('article');

// Refresh token when needed
await client.refreshToken();
```

**See detailed documentation:**
- [NodeHive API Key Authentication](NODEHIVE_API_KEY.md) - Simplest method ⭐
- [OAuth Authentication](OAUTH_AUTHENTICATION.md) - OAuth 2.0 flows

## Run tests
```
cd package
npm run test
```

# Publish nodehive-js on npm

```
# go into the package folder
cd package

# https://docs.npmjs.com/cli/v8/commands/npm-publish
# update package/package.json with new version number
npm version 2.0.0-beta.1

npm login

# if it's a beta release
npm publish . --tag beta

# if new latest release
npm publish

# if something went wrong
npm unpublish nodehive-js@2.0.0

```