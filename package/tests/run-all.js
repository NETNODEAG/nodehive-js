#!/usr/bin/env node

/**
 * Test Suite Runner
 * Runs all test files and provides a summary
 */

import { TestHelper } from './test-helper.js';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m'
};

const testSuites = [
    { name: 'Core API', file: './core.test.js' },
    { name: 'Authentication', file: './auth.test.js' },
    { name: 'Taxonomy', file: './taxonomy.test.js' },
    { name: 'Media', file: './media.test.js' },
    { name: 'Error Handling', file: './error-handling.test.js' }
];

async function runSuite(suite) {
    console.log(`\n${colors.bold}${colors.cyan}━━━ Running ${suite.name} Tests ━━━${colors.reset}`);

    try {
        const module = await import(suite.file);
        if (module.runTests) {
            const exitCode = await module.runTests();
            return { success: exitCode === 0 || exitCode === undefined, name: suite.name };
        } else {
            console.error(`${colors.red}No runTests export found in ${suite.file}${colors.reset}`);
            return { success: false, name: suite.name };
        }
    } catch (error) {
        console.error(`${colors.red}Failed to run ${suite.name}: ${error.message}${colors.reset}`);
        return { success: false, name: suite.name, error };
    }
}

async function runAll() {
    console.log(`${colors.bold}${colors.magenta}🧪 NodeHiveClient Complete Test Suite${colors.reset}`);
    console.log('═'.repeat(50));
    console.log(`${colors.blue}Backend: https://netnode.nodehive.app${colors.reset}`);
    console.log(`${colors.blue}Test Suites: ${testSuites.length}${colors.reset}`);
    console.log('═'.repeat(50));

    const startTime = Date.now();
    const results = [];

    // Run tests sequentially to avoid overwhelming the backend
    for (const suite of testSuites) {
        const result = await runSuite(suite);
        results.push(result);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Final summary
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`${colors.bold}${colors.magenta}FINAL SUMMARY${colors.reset}`);
    console.log('═'.repeat(50));

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    results.forEach(result => {
        const icon = result.success ? `${colors.green}✓` : `${colors.red}✗`;
        const status = result.success ? `${colors.green}PASSED` : `${colors.red}FAILED`;
        console.log(`${icon} ${result.name}: ${status}${colors.reset}`);
    });

    console.log('\n' + '─'.repeat(50));
    console.log(`Total Suites: ${results.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    if (failed > 0) {
        console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    }
    console.log(`Duration: ${duration}s`);

    const allPassed = failed === 0;
    if (allPassed) {
        console.log(`\n${colors.bold}${colors.green}✨ All test suites passed!${colors.reset}`);
    } else {
        console.log(`\n${colors.bold}${colors.red}❌ ${failed} test suite(s) failed${colors.reset}`);
    }

    process.exit(allPassed ? 0 : 1);
}

// Add option to run specific suite
const args = process.argv.slice(2);
if (args.length > 0) {
    const suiteName = args[0].toLowerCase();
    const suite = testSuites.find(s =>
        s.name.toLowerCase().includes(suiteName) ||
        s.file.toLowerCase().includes(suiteName)
    );

    if (suite) {
        console.log(`Running single suite: ${suite.name}`);
        runSuite(suite).then(result => {
            process.exit(result.success ? 0 : 1);
        });
    } else {
        console.error(`Suite not found: ${args[0]}`);
        console.log('Available suites:');
        testSuites.forEach(s => console.log(`  - ${s.name}`));
        process.exit(1);
    }
} else {
    // Run all suites
    runAll().catch(error => {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}