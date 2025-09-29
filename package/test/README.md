# NodeHiveClient Test Suite

Comprehensive test suite for the NodeHiveClient library, organized by functionality for better maintainability.

## Test Structure

The test suite is organized into separate files by functionality:

- **`core.test.js`** - Core API functionality (nodes, content types, resources)
- **`auth.test.js`** - Authentication, authorization, and session management
- **`taxonomy.test.js`** - Taxonomy terms and vocabulary operations
- **`media.test.js`** - Media retrieval and management
- **`error-handling.test.js`** - Error scenarios, validation, and recovery

Additional test files:
- **`simple-test.js`** - Quick smoke test for basic functionality
- **`comprehensive-test.js`** - Single-file comprehensive test (legacy)
- **`test-helper.js`** - Shared utilities for all tests
- **`run-all.js`** - Test suite runner

## Running Tests

### Run all test suites
```bash
npm test
# or
npm run test:all
```

### Run individual test suites
```bash
npm run test:core       # Core API tests
npm run test:auth       # Authentication tests
npm run test:taxonomy   # Taxonomy tests
npm run test:media      # Media tests
npm run test:errors     # Error handling tests
```

### Run legacy tests
```bash
npm run test:simple         # Quick smoke test
npm run test:comprehensive  # Legacy comprehensive test
```

### Run specific suite via runner
```bash
node test/run-all.js core    # Run only core tests
node test/run-all.js auth    # Run only auth tests
```

## Test Configuration

Tests connect to the live backend at `https://netnode.nodehive.app`

Default test configuration:
- **Timeout**: 15 seconds
- **Retry**: Enabled with 2 attempts
- **Debug**: Disabled (set `DEBUG=1` environment variable to enable)

## Test Coverage

### Core API (10 tests)
- Content type retrieval
- Node operations (list, single, with params)
- Resource retrieval by slug
- Validation errors

### Authentication (14 tests)
- AuthManager initialization
- Storage adapters (Memory, Browser, Cookie)
- Token management
- Login state management
- JWT handling
- Session validation
- Backwards compatibility

### Taxonomy (9 tests + 1 skipped)
- Vocabulary term retrieval
- Single term operations
- Pagination
- Language support
- Backwards compatibility

### Media (11 tests)
- Media list operations
- Single media retrieval
- Media attributes
- Error handling
- Backwards compatibility

### Error Handling (16 tests)
- Network errors (timeout, 404, invalid domain)
- Validation errors
- Configuration errors
- Retry mechanism
- Error recovery
- Batch operations with failures

## Test Output

Tests use colored output for better readability:
- ✅ Green: Passed tests
- ❌ Red: Failed tests
- ⚠️ Yellow: Skipped tests
- ℹ️ Blue: Information messages
- 🔸 Gray: Debug output

## Writing New Tests

Use the `TestHelper` class for consistent test structure:

```javascript
import { TestHelper } from './test-helper.js';

const helper = new TestHelper('My Test Suite');

async function runTests() {
    await helper.section('Test Section');

    await helper.test('Test name', async () => {
        // Test code
        helper.assert(condition, 'Error message');
        helper.debug('Debug info');
    });

    await helper.summary();
}
```

## Test Expectations

All tests are designed to work with a standard NodeHive/Drupal installation. Some tests may be skipped if certain features are not configured (e.g., specific vocabularies or media types).

## Continuous Integration

The test suite is designed to be CI-friendly:
- Returns exit code 0 on success, 1 on failure
- Provides clear summary output
- Handles network failures gracefully
- Includes retry logic for transient failures