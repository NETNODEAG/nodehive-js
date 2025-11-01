// index.js
import { NodeHiveClient } from "./src/NodeHiveClient.js";
import {
  NodeHiveError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ConfigurationError,
} from "./src/errors.js";
import { AuthManager } from "./auth/AuthManager";
import { MemoryStorage } from "./auth/storage/MemoryStorage.js";
import { BrowserStorage } from "./auth/storage/BrowserStorage.js";
import { CookieStorage } from "./auth/storage/CookieStorage.js";
import { ApiKeyStrategy } from "./auth/strategies/ApiKeyStrategy.js";
import { JwtStrategy } from "./auth/strategies/JwtStrategy.js";
import { OAuthClientCredentialsStrategy } from "./auth/strategies/OAuthClientCredentialsStrategy.js";
import { OAuthPasswordStrategy } from "./auth/strategies/OAuthPasswordStrategy.js";

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
  OAuthClientCredentialsStrategy,
  OAuthPasswordStrategy,
};
