#!/usr/bin/env node
/**
 * KM Documentation Linter CLI
 * Placeholder implementation - linter is in development
 */

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const file = args[1];

console.log(`[docs-linter] ${command} ${file || ''} - SKIPPED (linter in development)`);

// Exit successfully for now
process.exit(0);
