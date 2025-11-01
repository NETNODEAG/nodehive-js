# nodehive-js
JavaScript client library for NodeHive Headless CMS.

## What is NodeHive?
NodeHive headless CMS is a headless composable platform that serves as a your central commerce, marketing/communication and customer engagement hub.

It’s everything you need to run multiple websites, from one backend.

- https://www.nodehive.com
- https://docs.nodehive.com - Developer documentation

## About nodehive-js SDK
The nodehive-js SDK provides a suite of developer tools for easily fetching data from a NodeHive backend.

## Features
- TypeScript Support
- Load Nodes
- Load Menus
- Load Fragments
- Load Areas
- Load Paragraphs
- Load Taxonomies and Terms
- Routing & Slug resolution
- Strategy-based authentication (API key, OAuth password/client credentials, JWT)

## Authentication

The client ships with a flexible authentication manager that supports multiple strategies out of the box. Configure the strategy when you initialise `NodeHiveClient`:

Available strategies:

- **API Key** (`method: 'nodehive-api-key'`): best for server-to-server usage, no expiry handling required.
- **OAuth Password** (`grantType: 'password'`): authenticates end users with username/password credentials.
- **OAuth Client Credentials** (`grantType: 'client_credentials'`): service accounts with automatic token refresh.
- **JWT** (`method: 'jwt'`): legacy support for Drupal JWT endpoints.

Tokens, refresh tokens, and user details are stored through pluggable storage adapters (`MemoryStorage`, `BrowserStorage`, `CookieStorage`, or a custom adapter). You can also control persistence behaviour via the `session` options or by calling the new helpers (`setToken`, `setTokenExpiresAt`, `setRefreshToken`, etc.) directly on `client.auth`.

## NextJS Starter for NodeHive Frontend
To begin building a frontend for NodeHive, utilize our starter template available at: https://github.com/NETNODEAG/nodehive-nextjs-starter.


## Contribute
If you encounter any issues or have suggestions for enhancements, we invite you to submit a pull request at https://github.com/NETNODEAG/nodehive-js.
