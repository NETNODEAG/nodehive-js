// index.js
import { NodeHiveClient } from "./src/NodeHiveClient.js";
import {
  NodeHiveError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ConfigurationError,
} from "./src/errors.js";
import { AuthManager } from "./src/auth/AuthManager.js";
import { MemoryStorage } from "./src/auth/storage/MemoryStorage.js";
import { BrowserStorage } from "./src/auth/storage/BrowserStorage.js";
import { CookieStorage } from "./src/auth/storage/CookieStorage.js";
import { ApiKeyStrategy } from "./src/auth/strategies/ApiKeyStrategy.js";
import { JwtStrategy } from "./src/auth/strategies/JwtStrategy.js";
import { OAuthAuthorizationCodeStrategy } from "./src/auth/strategies/OAuthAuthorizationCodeStrategy.js";
import { OAuthClientCredentialsStrategy } from "./src/auth/strategies/OAuthClientCredentialsStrategy.js";
import { OAuthPasswordStrategy } from "./src/auth/strategies/OAuthPasswordStrategy.js";
import { generatePKCE, generateState } from "./src/auth/oauth/pkce.js";
import { buildAuthorizeUrl } from "./src/auth/oauth/authorize-url.js";

export {
  NodeHiveClient,
  // Error classes
  NodeHiveError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ConfigurationError,
  // Auth classes
  AuthManager,
  MemoryStorage,
  BrowserStorage,
  CookieStorage,
  ApiKeyStrategy,
  JwtStrategy,
  OAuthAuthorizationCodeStrategy,
  OAuthClientCredentialsStrategy,
  OAuthPasswordStrategy,
  // OAuth helpers (Authorization Code + PKCE)
  generatePKCE,
  generateState,
  buildAuthorizeUrl,
};
