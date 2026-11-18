/**
 * Regression tests for detection/fix bugs in src/rules/*.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import DocsLinter from '../src/linter.js';
import FormattingRules from '../src/rules/formatting.js';
import ContentRules from '../src/rules/content.js';
import TechnicalRules from '../src/rules/technical.js';

function makeContext(content, patterns = null) {
  const linter = new DocsLinter();
  const ast = linter.processor.parse(content);
  return { content, file: 'README.md', ast, patterns, corrections: null, options: {} };
}

// --- #1: code-fence / frontmatter guard (content.js) ---

test('content rules do not flag vague/passive/semicolon/list-count inside a fenced code block', async () => {
  const content = '# Title\n\n```\nyou can see it is created; there are 3 things\n```\n\nClean.\n';
  const issues = await new ContentRules().check(makeContext(content, {}));
  const flagged = issues.filter(i =>
    /^(vague-language|passive-voice|semicolon-in-prose|list-count-in-prose)/.test(i.id));
  assert.deepEqual(flagged, [], 'no prose findings should come from inside a code fence');
});

test('content rules do not flag vague/passive/semicolon/list-count inside YAML frontmatter', async () => {
  const content = '---\ntitle: you can do this; it is created\nsummary: there are 3 steps\n---\n\n# Title\n\nClean prose here.\n';
  const issues = await new ContentRules().check(makeContext(content, {}));
  const flagged = issues.filter(i =>
    /^(vague-language|passive-voice|semicolon-in-prose|list-count-in-prose)/.test(i.id));
  assert.deepEqual(flagged, [], 'no prose findings should come from frontmatter');
});

test('content rules still flag vague/passive/semicolon/list-count in real prose', async () => {
  const content = '# Title\n\nyou can see it is created; there are 3 things.\n';
  const issues = await new ContentRules().check(makeContext(content, {}));
  const ids = issues.map(i => i.id);
  assert.ok(ids.some(id => id.startsWith('vague-language')), 'vague language still flagged');
  assert.ok(ids.some(id => id.startsWith('passive-voice')), 'passive voice still flagged');
  assert.ok(ids.some(id => id.startsWith('semicolon-in-prose')), 'semicolon still flagged');
  assert.ok(ids.some(id => id.startsWith('list-count-in-prose')), 'list count still flagged');
});

// --- #2: single, collision-free outdated-year rule ---

test('an old year produces exactly one outdated-year issue with a unique id', async () => {
  const content = '# Title\n\nReleased in 2000 originally.\n';
  const ctx = makeContext(content);
  const issues = [
    ...await new ContentRules().check(ctx),
    ...await new TechnicalRules().check(ctx)
  ];
  const yearIssues = issues.filter(i => i.id.startsWith('outdated-year'));
  assert.equal(yearIssues.length, 1, 'exactly one year issue, not a duplicate');
  const ids = new Set(yearIssues.map(i => i.id));
  assert.equal(ids.size, yearIssues.length, 'year issue ids must be unique (no collision)');
});

// --- #3: single "for more information around" rule ---

test('"for more information around" is flagged exactly once across rule sets', async () => {
  const content = '# Title\n\nFor more information around this topic, see the guide.\n';
  const ctx = makeContext(content, {});
  const issues = [
    ...await new ContentRules().check(ctx),
    ...await new FormattingRules().check(ctx)
  ];
  const around = issues.filter(i => /around/i.test(i.message) || /preposition/.test(i.id));
  assert.equal(around.length, 1, 'only one issue per occurrence');
});

// --- #4: technical command line numbers + shell-only scanning ---

test('shell command issues report the real line and plaintext blocks are not scanned', async () => {
  const content = '# Doc\n\n```bash\necho one\n$ rm file\n```\n\n```\n$ not scanned\n```\n';
  const issues = await new TechnicalRules().check(makeContext(content));
  const prompts = issues.filter(i => i.id.startsWith('command-prompt'));
  assert.equal(prompts.length, 1, 'only the shell block is scanned, not the plaintext block');
  assert.equal(prompts[0].line, 5, 'the $ command on file line 5 is reported at line 5');
});

// --- #5: spacing detection/fix use the same threshold, inline code untouched ---

test('spacing rule uses a 3+ threshold and never collapses inside inline code', async () => {
  const content = '# Title\n\na  b\n\na   c\n\nx   y `a   b` z\n';
  const issues = await new FormattingRules().check(makeContext(content));
  const spacing = issues.filter(i => i.id.startsWith('spacing-multiple'));

  assert.ok(!spacing.some(i => i.line === 3), 'two spaces (line 3) must not be flagged');

  const line5 = spacing.find(i => i.line === 5);
  assert.ok(line5, 'three spaces (line 5) should be flagged');
  assert.equal(line5.fix.to, 'a c', 'fix collapses the detected 3+ run');

  const line7 = spacing.find(i => i.line === 7);
  assert.ok(line7, 'three spaces outside inline code (line 7) should be flagged');
  assert.equal(line7.fix.to, 'x y `a   b` z', 'spaces inside inline code are preserved');
});

// --- #6: four-backtick code fence detection is not auto-fixed ---

test('four-backtick code fence is detected but not auto-fixed', async () => {
  const content = '~~~\n````\n~~~\n';
  const issues = await new FormattingRules().check(makeContext(content));
  const fence = issues.find(i => i.id.startsWith('code-fence'));
  assert.ok(fence, 'four-backtick fence should still be detected');
  assert.equal(fence.fixable, false, 'it must not claim to be fixable');
  assert.equal(fence.fix, undefined, 'no (broken) fix should be attached');
});

// --- #7: toTitleCase tokenization + punctuation + hyphens ---

test('toTitleCase handles small words, trailing punctuation, hyphens, tabs and double spaces', () => {
  const fmt = new FormattingRules();
  assert.equal(fmt.toTitleCase('getting started with sap'), 'Getting Started With Sap');
  assert.equal(fmt.toTitleCase('refer to, the guide'), 'Refer to, the Guide');
  assert.equal(fmt.toTitleCase('built-in and custom'), 'Built-in and Custom');
  assert.equal(fmt.toTitleCase('overview  guide'), 'Overview Guide');
  assert.equal(fmt.toTitleCase('setup\tguide'), 'Setup Guide');
});

// --- #8: hasNearbyExplanation looks after the closing fence ---

test('code block with an explanation after the closing fence is not flagged', async () => {
  const longCode = 'echo ' + 'a'.repeat(60);
  const content = `# Doc\n\n\`\`\`\n${longCode}\n\`\`\`\nThis explains the code block above clearly.\n`;
  const issues = await new ContentRules().check(makeContext(content));
  assert.ok(!issues.some(i => i.id.startsWith('code-needs-explanation')),
    'explanation after the block should suppress the issue');
});

test('code block with no surrounding explanation is still flagged', async () => {
  const longCode = 'echo ' + 'a'.repeat(60);
  const content = `# Doc\n\n\`\`\`\n${longCode}\n\`\`\`\n`;
  const issues = await new ContentRules().check(makeContext(content));
  assert.ok(issues.some(i => i.id.startsWith('code-needs-explanation')),
    'a lone long code block should still be flagged');
});

// --- #9: anchor slug dedupe + ignore # inside code fences ---

test('anchor targets dedupe repeated headings and ignore # inside code fences', async () => {
  const content = '# Guide\n\n## Install\n\n## Install\n\n```\n# Secret Section\n```\n\nSee [install again](#install-1).\n\nSee [secret](#secret-section).\n';
  const issues = await new ContentRules().check(makeContext(content));
  assert.ok(!issues.some(i => i.id === 'broken-internal-link-install-1'),
    'the deduped #install-1 anchor must resolve');
  assert.ok(issues.some(i => i.id === 'broken-internal-link-secret-section'),
    'a # inside a code fence is not a heading, so #secret-section is broken');
});

// --- #10: tolerate JSONC, still catch invalid JSON ---

test('JSONC (comments / trailing commas) is not flagged as invalid', async () => {
  const content = '# Config\n\n```json\n{\n  "name": "demo", // a comment\n  "list": [1, 2,]\n}\n```\n';
  const issues = await new TechnicalRules().check(makeContext(content));
  assert.ok(!issues.some(i => i.id.startsWith('invalid-json')),
    'JSONC must not be reported as invalid JSON');
});

test('genuinely invalid JSON is still flagged', async () => {
  const content = '# Config\n\n```json\n{ "a": "b" "c": 1 }\n```\n';
  const issues = await new TechnicalRules().check(makeContext(content));
  assert.ok(issues.some(i => i.id.startsWith('invalid-json')),
    'malformed JSON (no JSONC markers) should still be flagged');
});
