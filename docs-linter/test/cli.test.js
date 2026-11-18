/**
 * CLI behavior tests (exit codes, output integrity, guards).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, '../src/cli.js');

function runCli(args) {
  try {
    const stdout = execFileSync('node', [CLI, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    return { status: err.status ?? 1, stdout: err.stdout?.toString() ?? '', stderr: err.stderr?.toString() ?? '' };
  }
}

function withTempFile(content, name, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'docs-linter-cli-'));
  const file = path.join(dir, name);
  writeFileSync(file, content);
  try {
    return fn(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// --- #7: check --json produces complete, parseable output ---

test('check --json emits complete parseable JSON', () => {
  withTempFile('# Overview\n\nSome content with [TODO] here.\n', 'doc.md', (file) => {
    const { stdout } = runCli(['check', '--json', file]);
    const jsonStart = stdout.indexOf('{');
    const parsed = JSON.parse(stdout.slice(jsonStart));
    assert.ok(parsed.summary, 'JSON must include a summary (not truncated)');
    assert.ok(Array.isArray(parsed.issues));
  });
});

test('check exits non-zero when an error-severity issue is present', () => {
  withTempFile('# Overview\n\n[TODO] finish this.\n', 'doc.md', (file) => {
    const { status } = runCli(['check', file]);
    assert.equal(status, 1);
  });
});

// --- #7: validate --fail-under threshold ---

test('validate exits 0 by default regardless of score', () => {
  withTempFile('# Overview\n\n[TODO] lots of problems here.\n', 'doc.md', (file) => {
    const { status } = runCli(['validate', file]);
    assert.equal(status, 0);
  });
});

test('validate exits non-zero when score is below --fail-under', () => {
  withTempFile('# Overview\n\nContent.\n', 'doc.md', (file) => {
    const { status } = runCli(['validate', '--fail-under', '101', file]);
    assert.equal(status, 1);
  });
});

// --- #8: score color is applied, not printed as a function source ---

test('validate does not print a chalk function source in the score line', () => {
  withTempFile('# Overview\n\nContent.\n', 'doc.md', (file) => {
    const { stdout } = runCli(['validate', file]);
    assert.ok(!/\[Function/i.test(stdout), 'output must not contain a function source');
    assert.ok(/Overall:\s*\d+\/100/.test(stdout), 'score should render as N/100');
  });
});

test('validate prints the file path in the score header', () => {
  withTempFile('# Overview\n\nContent.\n', 'doc.md', (file) => {
    const { stdout } = runCli(['validate', file]);
    assert.ok(stdout.includes(`Quality Score: ${file}`), 'header should include the file path');
  });
});

// --- #10: fix rejects non-markdown files ---

test('fix rejects a non-markdown file', () => {
  withTempFile('plain text\n', 'notes.txt', (file) => {
    const { status, stderr } = runCli(['fix', file]);
    assert.equal(status, 1);
    assert.match(stderr, /markdown/i);
  });
});
