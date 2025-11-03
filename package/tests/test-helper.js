/**
 * Test Helper Utilities
 * Shared utilities for all test files
 */

export class TestHelper {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.BACKEND_URL = 'https://netnode.nodehive.app';

        this.colors = {
            reset: '\x1b[0m',
            green: '\x1b[32m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            gray: '\x1b[90m',
            cyan: '\x1b[36m',
            magenta: '\x1b[35m'
        };
    }

    log(color, symbol, message) {
        console.log(`${this.colors[color]}${symbol}${this.colors.reset} ${message}`);
    }

    success(msg) {
        this.log('green', '✓', msg);
    }

    error(msg) {
        this.log('red', '✗', msg);
    }

    info(msg) {
        this.log('blue', 'ℹ', msg);
    }

    debug(msg) {
        console.log(`${this.colors.gray}  ${msg}${this.colors.reset}`);
    }

    section(title) {
        console.log(`\n${this.colors.yellow}${title}${this.colors.reset}`);
        console.log(`${this.colors.gray}${'─'.repeat(title.length)}${this.colors.reset}`);
    }

    subsection(title) {
        console.log(`${this.colors.cyan}  ${title}${this.colors.reset}`);
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    async test(name, testFn) {
        try {
            const result = await testFn();
            this.passed++;
            this.success(name);
            return result;
        } catch (error) {
            this.failed++;
            const message = error instanceof Error ? error.message : String(error);
            this.error(`${name}: ${message}`);
            if (process.env.DEBUG && error instanceof Error) {
                console.error(error.stack);
            }
            throw error;
        }
    }

    skip(name, reason = '') {
        this.skipped++;
        this.info(`${name} - SKIPPED${reason ? ': ' + reason : ''}`);
    }

    async summary() {
        console.log('\n' + '='.repeat(50));
        console.log(`${this.colors.magenta}${this.suiteName} - Summary${this.colors.reset}`);
        console.log('='.repeat(50));

        const total = this.passed + this.failed + this.skipped;
        const percentage = this.failed === 0 && this.passed > 0 ? 100 :
                          this.passed > 0 ? Math.round((this.passed / (this.passed + this.failed)) * 100) : 0;

        console.log(`${this.colors.green}✓ Passed: ${this.passed}${this.colors.reset}`);
        if (this.failed > 0) {
            console.log(`${this.colors.red}✗ Failed: ${this.failed}${this.colors.reset}`);
        }
        if (this.skipped > 0) {
            console.log(`${this.colors.yellow}⊘ Skipped: ${this.skipped}${this.colors.reset}`);
        }

        console.log(`\nTotal: ${total} tests`);
        console.log(`Success Rate: ${percentage}%`);

        if (this.failed === 0 && this.passed > 0) {
            console.log(`\n${this.colors.green}✨ All tests passed!${this.colors.reset}`);
            return 0;
        } else if (this.failed > 0) {
            console.log(`\n${this.colors.red}❌ ${this.failed} test(s) failed${this.colors.reset}`);
            return 1;
        } else {
            console.log(`\n${this.colors.yellow}⚠ No tests were run${this.colors.reset}`);
            return 0;
        }
    }

    startTimer() {
        return Date.now();
    }

    endTimer(start) {
        const duration = Date.now() - start;
        return `${duration}ms`;
    }
}
