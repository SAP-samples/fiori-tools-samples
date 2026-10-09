/**
 * Smoke tests - verify all modules import and basic functionality works
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import DocsLinter from '../src/linter.js';
import StructuralRules from '../src/rules/structural.js';
import FormattingRules from '../src/rules/formatting.js';
import ContentRules from '../src/rules/content.js';
import TechnicalRules from '../src/rules/technical.js';

const MINIMAL_MD = `# Overview\n\nThis is a test document.\n\n## Prerequisites\n\nNone.\n`;

// --- Module imports ---

test('DocsLinter instantiates without error', () => {
  const linter = new DocsLinter();
  assert.ok(linter);
  assert.ok(linter.processor);
});

test('StructuralRules instantiates without error', () => {
  assert.ok(new StructuralRules());
});

test('FormattingRules instantiates without error', () => {
  assert.ok(new FormattingRules());
});

test('ContentRules instantiates without error', () => {
  assert.ok(new ContentRules());
});

test('TechnicalRules instantiates without error', () => {
  assert.ok(new TechnicalRules());
});

// --- Core linter ---

test('DocsLinter.processor parses markdown to AST', () => {
  const linter = new DocsLinter();
  const ast = linter.processor.parse(MINIMAL_MD);
  assert.equal(ast.type, 'root');
  assert.ok(Array.isArray(ast.children));
  assert.ok(ast.children.length > 0);
});

// --- Rule checks return arrays ---

function makeContext(content, file = 'README.md') {
  const linter = new DocsLinter();
  const ast = linter.processor.parse(content);
  return { content, file, ast, patterns: null, corrections: null, options: {} };
}

test('StructuralRules.check returns an array', async () => {
  const issues = await new StructuralRules().check(makeContext(MINIMAL_MD));
  assert.ok(Array.isArray(issues));
});

test('FormattingRules.check returns an array', async () => {
  const issues = await new FormattingRules().check(makeContext(MINIMAL_MD));
  assert.ok(Array.isArray(issues));
});

test('ContentRules.check returns an array', async () => {
  const issues = await new ContentRules().check(makeContext(MINIMAL_MD));
  assert.ok(Array.isArray(issues));
});

test('TechnicalRules.check returns an array', async () => {
  const issues = await new TechnicalRules().check(makeContext(MINIMAL_MD));
  assert.ok(Array.isArray(issues));
});

// --- Issue shape ---

test('issues have required fields when returned', async () => {
  const issues = await new StructuralRules().check(makeContext('# Title\n\nContent only.\n'));
  issues.forEach(issue => {
    assert.ok(typeof issue.id === 'string', 'issue.id must be a string');
    assert.ok(typeof issue.category === 'string', 'issue.category must be a string');
    assert.ok(typeof issue.severity === 'string', 'issue.severity must be a string');
    assert.ok(typeof issue.message === 'string', 'issue.message must be a string');
  });
});

// --- Quality score ---

test('calculateQualityScore returns a number between 0 and 100', () => {
  const score = new DocsLinter().calculateQualityScore([], 'README.md');
  assert.ok(score >= 0 && score <= 100);
});

test('calculateQualityScore decrements for errors, warnings, and info', () => {
  const issues = [{ severity: 'error' }, { severity: 'warning' }, { severity: 'info' }];
  const score = new DocsLinter().calculateQualityScore(issues, 'README.md');
  assert.equal(score, 100 - 10 - 5 - 2);
});

// --- generateSummary ---

test('generateSummary returns correct counts', () => {
  const issues = [
    { severity: 'error', category: 'structural', fixable: true },
    { severity: 'warning', category: 'formatting', fixable: false },
    { severity: 'info', category: 'content', fixable: true }
  ];
  const summary = new DocsLinter().generateSummary(issues);
  assert.equal(summary.total, 3);
  assert.equal(summary.errors, 1);
  assert.equal(summary.warnings, 1);
  assert.equal(summary.info, 1);
  assert.equal(summary.fixable, 2);
});
