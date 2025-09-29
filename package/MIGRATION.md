# NodeHive Client v2 Migration Guide

## Overview

NodeHive Client v2 brings significant ergonomic improvements while maintaining backwards compatibility. Here's what's changed and how to migrate.

## Key Improvements

### 1. Modern Constructor with Options Object

**Before:**
```javascript
const client = new NodeHiveClient('https://api.example.com', config, { debug: true });
```

**After:**
```javascript
const client = new NodeHiveClient({
  baseUrl: 'https://api.example.com',
  config: config,
  debug: true,
  defaultLanguage: 'en',
  timeout: 30000,
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000
  }
});
```

### 2. Better Error Handling

**Before:**
```javascript
try {
  const data = await client.getNode(uuid, type);
} catch (error) {
  console.log(error.message); // Generic error
}
```

**After:**
```javascript
import { NetworkError, ValidationError } from 'nodehive-js';

try {
  const data = await client.getNode(uuid, type);
} catch (error) {
  if (error instanceof NetworkError) {
    console.log(`HTTP ${error.status}: ${error.message}`);
    console.log('Failed URL:', error.url);
    console.log('Response:', error.response);
  } else if (error instanceof ValidationError) {
    console.log(`Invalid ${error.field}: ${error.message}`);
  }
}
```

### 3. Unified Method Signatures with Options

**Before:**
```javascript
// Inconsistent parameter order
await client.getNodes('article', 'en', params);
await client.getMedia(uuid, 'image', 'en', params);
await client.getTaxonomies('tags', null, params);
```

**After:**
```javascript
// Consistent options object
await client.getNodes('article', { lang: 'en', params });
await client.getMedia(uuid, 'image', { lang: 'en', params });
await client.getTaxonomyTerms('tags', { params }); // Note: renamed method
```

### 4. Improved Authentication

**Before:**
```javascript
// Browser-only, cookie-based
await client.login(email, password);
const token = client.getToken(); // From cookies
```

**After:**
```javascript
// Flexible storage options
const client = new NodeHiveClient({
  baseUrl: 'https://api.example.com',
  auth: {
    storage: {
      type: 'localStorage' // or 'sessionStorage', 'cookie', 'memory', 'custom'
    }
  }
});

const result = await client.login(email, password);
console.log(result.token, result.user);

// Or use custom storage
import { MemoryStorage } from 'nodehive-js';
const client = new NodeHiveClient({
  baseUrl: 'https://api.example.com',
  auth: {
    storage: {
      type: 'custom',
      adapter: new MemoryStorage()
    }
  }
});
```

### 5. Request/Response Interceptors

```javascript
const client = new NodeHiveClient({
  baseUrl: 'https://api.example.com',
  interceptors: [
    {
      request: async (config, { url }) => {
        console.log(`Making request to: ${url}`);
        config.headers['X-Custom-Header'] = 'value';
        return config;
      },
      response: async (data, { response }) => {
        console.log(`Response status: ${response.status}`);
        return data;
      }
    }
  ]
});

// Or add dynamically
const removeInterceptor = client.addRequestInterceptor(async (config) => {
  config.headers['Authorization'] = 'Bearer custom-token';
  return config;
});

// Remove when done
removeInterceptor();
```

### 6. Batch Operations

```javascript
// Fetch multiple resources in parallel
const results = await client.batch([
  { method: 'getNode', args: ['uuid1', 'article'] },
  { method: 'getNode', args: ['uuid2', 'page'] },
  { method: 'getMediaList', args: ['image'] }
]);

// Handle errors gracefully
results.forEach((result, index) => {
  if (result.error) {
    console.error(`Request ${index} failed:`, result.error);
  } else {
    console.log(`Request ${index} data:`, result);
  }
});
```

### 7. Pagination Helper

```javascript
// Iterate through all pages automatically
const client = new NodeHiveClient({ baseUrl: 'https://api.example.com' });

// Using async generator
for await (const page of client.paginate('getNodes', ['article'], 25)) {
  console.log(`Processing ${page.length} articles`);
  page.forEach(article => {
    console.log(article.attributes.title);
  });
}
```

### 8. Improved Method Names

```javascript
// Before
await client.getMedias('image');      // Incorrect English
await client.getTaxonomies('tags');   // Confusing name

// After
await client.getMediaList('image');   // Proper English
await client.getTaxonomyTerms('tags'); // Clear what it returns
```

## Breaking Changes

While we maintain backwards compatibility through deprecation warnings, here are the main breaking changes if you remove deprecated methods:

1. **Constructor signature** - Now expects options object
2. **Method signatures** - Language and params now in options object
3. **Return values** - More consistent response structure
4. **Authentication** - Cookie handling is now optional/pluggable

## Migration Checklist

- [ ] Update constructor calls to use options object
- [ ] Replace `getMedias()` with `getMediaList()`
- [ ] Replace `getTaxonomies()` with `getTaxonomyTerms()`
- [ ] Update method calls to use options object instead of positional parameters
- [ ] Replace direct cookie access with auth manager methods
- [ ] Add error type checking for better error handling
- [ ] Consider using interceptors for common headers/logging
- [ ] Leverage batch operations for parallel requests
- [ ] Use pagination helper for large datasets

## Complete Example

```javascript
import {
  NodeHiveClient,
  NetworkError,
  BrowserStorage
} from 'nodehive-js';

// Initialize with all features
const client = new NodeHiveClient({
  baseUrl: 'https://api.example.com',
  debug: process.env.NODE_ENV === 'development',
  defaultLanguage: 'en',
  timeout: 30000,
  auth: {
    storage: {
      type: typeof window !== 'undefined' ? 'localStorage' : 'memory'
    }
  },
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000
  },
  interceptors: [{
    request: async (config, { url }) => {
      console.log(`[API] ${config.method} ${url}`);
      return config;
    },
    response: async (data, { response, url }) => {
      console.log(`[API] Response from ${url}:`, response.status);
      return data;
    }
  }]
});

// Login with better error handling
try {
  const { token, user } = await client.login('user@example.com', 'password');
  console.log('Logged in as:', user.email);
} catch (error) {
  if (error instanceof NetworkError && error.status === 401) {
    console.error('Invalid credentials');
  } else {
    console.error('Login failed:', error.message);
  }
}

// Fetch content with options
const articles = await client.getNodes('article', {
  lang: 'en',
  params: new DrupalJsonApiParams()
    .addFilter('status', '1')
    .addSort('created', 'DESC')
    .addPageLimit(10)
});

// Use convenience methods
const resource = await client.getResourceBySlug('about-us', { lang: 'en' });

// Batch operations
const [menu, taxonomy, media] = await client.batch([
  { method: 'getMenuItems', args: ['main'] },
  { method: 'getTaxonomyTerms', args: ['categories'] },
  { method: 'getMediaList', args: ['image', { params: new DrupalJsonApiParams().addPageLimit(5) }] }
]);

// Pagination
for await (const page of client.paginate('getNodes', ['article'], 50)) {
  await processArticles(page);
}
```