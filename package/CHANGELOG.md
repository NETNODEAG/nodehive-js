# Changelog

## 2.0.0-beta.18

### Added
- `getTranslationPaths(path, options?)`: opt-in Public API helper for existing, accessible translations, with URL-encoded path and optional source-language `options.lang`. Returns a bare language-to-path map and preserves token/request options.

### Deprecated
- `getTranslatedPaths()` is documented as deprecated without changing its implementation or signature. No automatic migration or removal is scheduled. Consumers of the new method must handle missing language keys and isolate personally authenticated caches.

## 2.0.0-beta.17

### Changed

- Use `drupal-jsonapi-params` 3 internally while accepting v2 and v3 builders in SDK requests and pagination.
- Legacy `getMedias()` and `getTaxonomies()` parameters now use `ResourceParams`, matching modern methods and accepting builders or plain query objects. Types extracted from these signatures now include plain objects; callers requiring builder methods must retain their concrete builder type.
- Upstream v3 compatibility note: `getQueryObject()` omits `include` and `sort` when unset instead of returning empty arrays. Direct consumers requiring the old shape can use `{ include: [], sort: [], ...params.getQueryObject() }`. Standard SDK query serialization is unchanged.

### Fixed

- Reuse supplied pagination builders and advance their actual request offsets. Preserve filters, language and options across modern and legacy query methods, including independently installed builder copies.
- Handle explicit empty options, missing legacy language arguments and terminal `next: null` links without repeating the first page.

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
