# Changelog

## Unreleased

### Changed

- Use `drupal-jsonapi-params` 3 internally while accepting v2 and v3 builders in SDK requests and pagination.
- Legacy `getMedias()` and `getTaxonomies()` parameters now use the structural `JsonApiParamsLike` interface. Direct builder calls and chaining remain supported. **Pre-release TypeScript breaking change:** types extracted from these method signatures no longer retain the concrete builder class identity; callers returning them as `DrupalJsonApiParams` must use the structural type or preserve their input type with a generic helper.

### Fixed

- Reuse supplied pagination builders and advance their actual request offsets. Preserve filters, language and options across modern and legacy query methods, including independently installed builder copies.
- Handle explicit empty options, missing legacy language arguments and terminal `next: null` links without repeating the first page.

### Tests

- Add backend-free v2/v3 runtime and TypeScript consumer matrices, multi-page request assertions and package-copy coverage. Run them before publishing.

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
