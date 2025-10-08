# NodeHive API Key Authentication

**The SIMPLEST and RECOMMENDED method for server-to-server authentication!**

NodeHive API Key is the easiest way to authenticate your application with NodeHive. Perfect for accessing public content through protected API endpoints.

## Why Use API Keys?

✅ **Simplest Setup** - Just one line of configuration
✅ **No Expiration** - Keys work indefinitely
✅ **No Login Required** - Start making requests immediately
✅ **Perfect for APIs** - Ideal for headless/decoupled architectures
✅ **User Permissions** - Permissions of assigned user apply
✅ **No OAuth Complexity** - No client configuration needed

## Quick Start

### 1. Create an API Key in NodeHive

1. Log into your NodeHive/Drupal instance
2. Navigate to: `/nodehive/api-keys`
3. Click "Create API Key"
4. Select a user (this user's permissions will apply)
5. Copy the generated API key (starts with `nhk_`)

### 2. Configure Your Application

```javascript
import { NodeHiveClient } from 'nodehive-js';

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        apiKey: process.env.NODEHIVE_API_KEY
    }
});

// That's it! Start making requests
const articles = await client.getNodes('article');
```

### 3. Set Environment Variable

```bash
# .env
DRUPAL_BASE_URL=https://your-site.com
NODEHIVE_API_KEY=nhk_09295ef8bd136f3008ff68de0d8abe7cf4312f8205d4ce17db44a8725a4e0e6b
```

## Complete Example

```javascript
import { NodeHiveClient } from 'nodehive-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        apiKey: process.env.NODEHIVE_API_KEY
    }
});

// No login() needed - just start fetching!
async function fetchContent() {
    // Fetch content types
    const contentTypes = await client.getContentTypes();
    console.log('Content types:', contentTypes.data.length);

    // Fetch articles
    const articles = await client.getNodes('article', {
        params: { 'page[limit]': 10 }
    });
    console.log('Articles:', articles.data.length);

    // Fetch media
    const media = await client.getMediaList('image');
    console.log('Images:', media.data.length);

    // Fetch menus
    const menus = await client.getMenus();
    console.log('Menus:', menus.data.length);
}

fetchContent();
```

## How It Works

When you configure an API Key:

1. The API key is set as a **Bearer token** in the `Authorization` header
2. No login call is needed - the client is immediately authenticated
3. NodeHive validates the key and applies the permissions of the associated user
4. All requests use the same API key (no token expiration!)

**Behind the scenes:**
```http
GET /jsonapi/node/article HTTP/1.1
Host: your-site.com
Authorization: Bearer nhk_09295ef8bd136f3008ff68de0d8abe7cf4312f8205d4ce17db44a8725a4e0e6b
```

## Production Setup

### Create Dedicated API User

1. **Create a new user** in Drupal:
   - Username: `api_service` or `nodehive_api`
   - Email: `api@your-company.com`
   - Password: Strong random password (won't be used)

2. **Create an API role**:
   - Role name: `API Access Role`
   - Permissions:
     - ✅ `Access API Endpoints`
     - ✅ `View published content`
     - ✅ Add other permissions as needed

3. **Assign role to user**:
   - Edit the API user
   - Assign the "API Access Role"

4. **Generate API Key**:
   - Visit `/nodehive/api-keys`
   - Create new key
   - Select your API user
   - Copy the generated key

### Security Best Practices

```javascript
// ✅ DO: Use environment variables
const client = new NodeHiveClient({
    baseUrl: process.env.DRUPAL_BASE_URL,
    auth: {
        apiKey: process.env.NODEHIVE_API_KEY
    }
});

// ❌ DON'T: Hardcode API keys
const client = new NodeHiveClient({
    baseUrl: 'https://my-site.com',
    auth: {
        apiKey: 'nhk_hardcoded_key' // NEVER DO THIS!
    }
});
```

**Security Checklist:**
- ✅ Store API keys in environment variables
- ✅ Never commit API keys to version control
- ✅ Use secrets management in production (AWS Secrets Manager, etc.)
- ✅ Rotate keys periodically
- ✅ Use minimal permissions for the API user
- ✅ Monitor API key usage
- ✅ Revoke unused keys

## Testing Your Configuration

Visit [NodeHive Explorer](https://nodehive-explorer.vercel.app/) to test your API key:

1. Enter your site URL
2. Enter your API key
3. Test various endpoints
4. Verify permissions are working correctly

## Error Handling

```javascript
try {
    const articles = await client.getNodes('article');
} catch (error) {
    if (error.status === 401) {
        console.error('API Key is invalid or expired');
        // Check /nodehive/api-keys to verify key
    } else if (error.status === 403) {
        console.error('API user lacks permission for this operation');
        // Check user roles and permissions
    } else {
        console.error('Error:', error.message);
    }
}
```

## When to Use API Keys vs Other Methods

### Use API Keys When:
- ✅ You need simple server-to-server authentication
- ✅ Accessing public content through protected endpoints
- ✅ Building headless/decoupled applications
- ✅ Creating mobile apps or SPAs
- ✅ Running background jobs or cron tasks
- ✅ You want the simplest possible setup

### Use OAuth Password Grant When:
- You need to authenticate as specific users
- User-specific actions are required
- You need user sessions

### Use OAuth Client Credentials When:
- You need standard OAuth 2.0 compliance
- Working with systems that require OAuth
- You have specific scope requirements

### Use JWT When:
- You're maintaining legacy code (deprecated)

## Comparison Table

| Feature | API Key | OAuth Client Credentials | OAuth Password Grant |
|---------|---------|--------------------------|---------------------|
| Setup Complexity | ⭐ Simplest | ⭐⭐⭐ Complex | ⭐⭐ Moderate |
| Configuration | 1 line | Multiple settings | Multiple settings |
| Login Required | ❌ No | ❌ No | ✅ Yes |
| Token Expiration | ❌ Never | ✅ Yes | ✅ Yes |
| User Context | ✅ API user | Service account | Specific user |
| Best For | Most use cases | OAuth compliance | User auth |

## API Key Format

NodeHive API keys follow this format:
```
nhk_[64 hexadecimal characters]
```

Example:
```
nhk_09295ef8bd136f3008ff68de0d8abe7cf4312f8205d4ce17db44a8725a4e0e6b
```

**Key components:**
- `nhk_` - Prefix indicating NodeHive Key
- `64 chars` - Hex-encoded random bytes (32 bytes = 256 bits of entropy)

## Troubleshooting

### Error: "API Key is not configured"
**Solution:** Ensure `NODEHIVE_API_KEY` is set in your `.env` file

### Error: 401 Unauthorized
**Solution:**
- Verify API key is correct
- Check key exists in `/nodehive/api-keys`
- Ensure key is not revoked

### Error: 403 Forbidden
**Solution:**
- Check permissions of the user assigned to the API key
- Ensure user has "Access API Endpoints" permission
- Add required permissions to user's role

### API key works in Explorer but not in code
**Solution:**
- Verify environment variables are loaded (`dotenv.config()`)
- Check baseUrl matches exactly
- Ensure no extra whitespace in API key

## Advanced: Manual API Key Usage

If you need to use the API key outside the NodeHive client:

```javascript
const apiKey = process.env.NODEHIVE_API_KEY;

const response = await fetch('https://your-site.com/jsonapi/node/article', {
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json'
    }
});

const data = await response.json();
```

## FAQs

**Q: Can I use multiple API keys?**
A: Yes, create multiple keys for different purposes or environments.

**Q: Do API keys expire?**
A: No, they work indefinitely unless revoked.

**Q: Can I revoke an API key?**
A: Yes, delete it from `/nodehive/api-keys`.

**Q: Should I use different keys for dev/staging/production?**
A: Yes, absolutely! Create separate keys for each environment.

**Q: Can one key be used by multiple applications?**
A: Yes, but separate keys per app is better for security and monitoring.

## Related Documentation

- [OAuth Authentication](./OAUTH_AUTHENTICATION.md) - Alternative auth methods
- [Examples](./examples/) - Code examples
- [NodeHive Explorer](https://nodehive-explorer.vercel.app/) - Test tool

## Summary

NodeHive API Key is the **simplest and recommended** authentication method for most server-to-server use cases. With just one line of configuration, you can start accessing your NodeHive content immediately, without dealing with OAuth complexity or token expiration.

**Perfect for:**
- Headless CMS applications
- Mobile app backends
- Static site generators
- API integrations
- Background jobs
- Any server-to-server communication

Get started in 3 steps:
1. Create API key at `/nodehive/api-keys`
2. Set `NODEHIVE_API_KEY` in `.env`
3. Start making requests!
