/**
 * Regression tests for fix-safety and false-reporting bugs.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import DocsLinter from '../src/linter.js';
import StructuralRules from '../src/rules/structural.js';
import FormattingRules from '../src/rules/formatting.js';
import ContentRules from '../src/rules/content.js';

async function withTempFile(content, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'docs-linter-'));
  const file = path.join(dir, 'doc.md');
  writeFileSync(file, content);
  try {
    return await fn(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// --- Phase 1 #1: anchored replace ---

test('applyFixes replace only touches the reported line, not identical text elsewhere', async () => {
  await withTempFile('apple\napple\n', async (file) => {
    const linter = new DocsLinter();
    const result = await linter.applyFixes(file, [
      { issueId: 'r1', type: 'content', description: 'x', line: 1, fix: { type: 'replace', from: 'apple', to: 'orange' } }
    ]);
    const out = readFileSync(file, 'utf8');
    assert.equal(out, 'orange\napple\n');
    assert.equal(result.appliedCount, 1);
  });
});

test('applyFixes heading replace does not touch # inside a fenced code block', async () => {
  const content = '# Setup\n\n```bash\n# Setup step\n```\n';
  await withTempFile(content, async (file) => {
    const linter = new DocsLinter();
    await linter.applyFixes(file, [
      { issueId: 'h1', type: 'formatting', description: 'x', line: 1, fix: { type: 'replace', from: 'Setup', to: 'Setup Guide' } }
    ]);
    const out = readFileSync(file, 'utf8');
    assert.ok(out.includes('# Setup Guide'), 'heading should be updated');
    assert.ok(out.includes('# Setup step'), 'fenced code comment must be untouched');
  });
});

// --- Phase 1 #2: atomic / validated write ---

test('applyFixes leaves original intact when the result fails to parse', async () => {
  const original = '# Title\n\napple\n';
  await withTempFile(original, async (file) => {
    const linter = new DocsLinter();
    // Simulate a validation failure of the rewritten document.
    linter.processor = { parse: () => { throw new Error('boom'); } };
    await assert.rejects(() => linter.applyFixes(file, [
      { issueId: 'r1', type: 'content', description: 'x', line: 3, fix: { type: 'replace', from: 'apple', to: 'orange' } }
    ]));
    assert.equal(readFileSync(file, 'utf8'), original, 'original file must be unchanged');
  });
});

// --- Phase 1 #3: only mark fixed when actually applied ---

test('applyFixes does not report unhandled fix types as applied', async () => {
  await withTempFile('# Overview\n\nSAP BTP and BTP.\n', async (file) => {
    const linter = new DocsLinter();
    const result = await linter.applyFixes(file, [
      { issueId: 'term1', type: 'content', description: 'x', line: 3, fix: { type: 'standardize-terminology', variations: ['BTP'], preferred: 'SAP BTP' } }
    ]);
    assert.equal(result.appliedCount, 0);
    assert.deepEqual(result.appliedIssueIds, []);
  });
});

test('checkFile autoFixSafe marks issue.fixed true only for applied handled fixes', async () => {
  await withTempFile('# Overview\n\nHello world  \n', async (file) => {
    const linter = new DocsLinter();
    const result = await linter.checkFile(file, { autoFixSafe: true });
    const trailing = result.issues.find(i => i.id && i.id.startsWith('spacing-trailing'));
    assert.ok(trailing, 'expected a trailing-space issue');
    assert.equal(trailing.fixed, true);
    assert.ok(!readFileSync(file, 'utf8').split('\n')[2].endsWith(' '), 'trailing space removed');
  });
});

// --- Phase 1 #4: full heading text reconstruction ---

test('structural extractHeadings reconstructs heading text with inline code', () => {
  const linter = new DocsLinter();
  const ast = linter.processor.parse('## Configure `xs login`\n');
  const headings = new StructuralRules().extractHeadings(ast);
  assert.equal(headings.length, 1);
  assert.equal(headings[0].text, 'Configure xs login');
});

test('formatting heading check reads full text and never produces a truncated prose-matching fix', async () => {
  const content = '# Overview\n\n## Configure `xs login`\n\nConfigure your system first.\n';
  const linter = new DocsLinter();
  const ast = linter.processor.parse(content);
  const issues = await new FormattingRules().check({ content, file: 'README.md', ast, patterns: null, corrections: null, options: {} });
  issues.forEach(issue => {
    if (issue.fix && issue.fix.type === 'replace') {
      assert.notEqual(issue.fix.from, 'Configure ', 'must not use truncated heading text as a replacement source');
    }
  });
});

// --- Phase 1 #5: terminology false positive ---

test('terminology check does not flag a doc that uses only "SAP BTP"', async () => {
  const content = '# Overview\n\nDeploy to SAP BTP.\n\nUse SAP BTP everywhere.\n';
  const linter = new DocsLinter();
  const ast = linter.processor.parse(content);
  const issues = await new ContentRules().check({ content, file: 'README.md', ast, patterns: null, corrections: null, options: {} });
  const flagged = issues.find(i => i.id && i.id.startsWith('terminology-inconsistency-SAP-BTP'));
  assert.equal(flagged, undefined, 'SAP BTP-only doc must not flag inconsistency');
});

test('terminology check still flags a doc mixing "BTP" and "SAP BTP"', async () => {
  const content = '# Overview\n\nUse BTP here.\n\nUse SAP BTP there.\n';
  const linter = new DocsLinter();
  const ast = linter.processor.parse(content);
  const issues = await new ContentRules().check({ content, file: 'README.md', ast, patterns: null, corrections: null, options: {} });
  const flagged = issues.find(i => i.id && i.id.startsWith('terminology-inconsistency-SAP-BTP'));
  assert.ok(flagged, 'mixed BTP/SAP BTP usage should still flag');
});

// --- Phase 2 #9: fixFile applied reflects real work ---

test('fixFile reports applied false when there are zero fixes', async () => {
  await withTempFile('# Overview\n\nClean prose here.\n', async (file) => {
    const linter = new DocsLinter();
    const result = await linter.fixFile(file, { safeOnly: true });
    if (result.changes.length === 0) {
      assert.equal(result.applied, false);
    }
  });
});
