// index.js
import { NodeHiveClient } from './src/NodeHiveClient.js';
import {
    NodeHiveError,
    NetworkError,
    AuthenticationError,
    ValidationError,
    ConfigurationError
} from './src/errors.js';
import {
    AuthManager,
    MemoryStorage,
    BrowserStorage,
    CookieStorage
} from './src/auth.js';

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
    CookieStorage
};
