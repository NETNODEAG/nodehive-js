# Changelog

## 2.0.0-beta.13

### Added

- **OAuth 2.0 Authorization Code Flow with PKCE** (`grantType: 'authorization_code'`).
  - New strategy `OAuthAuthorizationCodeStrategy` with `exchangeCode()` + `refreshToken()`.
  - New helpers `generatePKCE()`, `generateState()`, `buildAuthorizeUrl()` (work in Node and browser via `crypto.subtle`).
  - `OAuthConfig` gains `authorizeUrl`, `tokenUrl`, `redirectUri`.
  - `AuthManager.exchangeCode()` delegate + `isAuthorizationCodeGrant()` predicate.
  - Re-fetches `user_details` after every refresh so role changes propagate (same mechanic as Password Grant).

### Changed

- `fetchUserDetails(token)` extracted from `OAuthPasswordStrategy` into shared helper `src/auth/helpers/user-details.js`. Password and Authorization Code strategies now share the same implementation.

### Tests

- 8 new unit tests for PKCE, state generation, authorize URL building, AuthManager wiring, code exchange, refresh rotation, and error surfacing.
