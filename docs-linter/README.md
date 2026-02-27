# KM Documentation Linter

Automated linting system for applying SAP Knowledge Management (KM) team documentation standards to markdown files.

## Overview

The KM Documentation Linter is a Node.js-based tool that automatically checks and fixes common documentation issues based on patterns extracted from 30+ commits of KM team feedback. It works in conjunction with the `/km-review` Claude Code skill for comprehensive documentation quality assurance.

## Architecture

### Rule Categories

1. **Structural Rules** (`src/rules/structural.js`)
   - Required sections validation
   - Heading hierarchy checks
   - Table of contents validation
   - Section ordering recommendations
   - Document length and structure balance

2. **Formatting Rules** (`src/rules/formatting.js`)
   - Heading capitalization (Title case for H1/H2, Sentence case for H3+)
   - List marker consistency (dashes vs asterisks)
   - Link phrasing ("see" vs "refer to", "about" vs "around")
   - Code block formatting (language tags, fence format)
   - Punctuation and spacing consistency

3. **Content Rules** (`src/rules/content.js`)
   - SAP terminology consistency (on-premise, SAP BTP, etc.)
   - Placeholder text detection ([TODO], [TBD])
   - Duplicate content identification
   - Clarity and readability checks
   - Complete list validation

4. **Technical Rules** (`src/rules/technical.js`)
   - Code syntax validation
   - Link validation (working URLs, proper protocols)
   - Version compatibility checks
   - Example completeness
   - Configuration accuracy

### Training Data

The linter learns from extracted KM feedback patterns stored in:
- `../training-data/km-feedback-patterns.json` - Analyzed patterns from commit feedback
- `../training-data/correction-dictionary.json` - Common corrections and typos
- `../training-data/quality-examples.json` - High-quality documentation examples

## Commands

### Check
Analyze a file for KM standards violations:
```bash
node src/cli.js check <file>
node src/cli.js check <file> --json
node src/cli.js check <file> --comprehensive
```

### Fix
Automatically fix issues:
```bash
node src/cli.js fix <file>
node src/cli.js fix <file> --dry-run
node src/cli.js fix <file> --safe-only
```

### Validate
Get quality score and recommendations:
```bash
node src/cli.js validate <file>
node src/cli.js validate <file> --json
```

## Current Status

### ✅ Implemented
- Complete rule implementation (structural, formatting, content, technical)
- CLI with check, fix, and validate commands
- Training data integration
- Auto-fix capabilities with safety flags
- Quality scoring system
- JSON output support
- **Full ESM compatibility** ✨

### 🔮 Planned
- Pre-commit hook integration
- CI/CD pipeline integration
- Watch mode for live feedback
- VS Code extension
- GitHub Action
- Custom rule configuration

## Integration with /km-review

The linter is designed to work with the `/km-review` Claude Code skill:

1. **Fast automated checks**: docs-linter runs first for objective rule violations
2. **Deep contextual review**: /km-review provides AI-powered analysis
3. **Combined output**: Merged findings with deduplication
4. **Hybrid fixes**: Safe auto-fixes + contextual improvements

## Usage in Development

### Pre-commit Hook
```bash
# Will be configured to run automatically
docs-linter check $STAGED_MD_FILES
```

### CI/CD Pipeline
```yaml
- name: Lint Documentation
  run: |
    find . -name "*.md" -not -path "*/node_modules/*" | \
    xargs -I {} node docs-linter/src/cli.js check {} --json
```

### Manual Review
```bash
# Check all README files
find . -name "README.md" -not -path "*/node_modules/*" | \
  xargs -I {} node src/cli.js validate {}
```

## Output Examples

### Check Output
```
📊 Checking onpremise/README.md...

Results:
  Total issues: 12
  Errors: 0
  Warnings: 5
  Info: 7
  Auto-fixable: 10

FORMATTING (8):
  ⚠ Heading capitalization (line 86)
     → H3+ headings should use sentence case
  ⚠ Heading capitalization (line 90)
     → H3+ headings should use sentence case
  ...

10 issues can be fixed automatically with: docs-linter fix onpremise/README.md
```

### Validate Output
```
📊 Quality Score: onpremise/README.md

Overall: 88/100
├─ Structure: 9/10
├─ Clarity: 9/10
├─ Maintainability: 9/10
└─ Developer Usability: 8/10

✓ Excellent - Meets KM standards
```

## Configuration

The linter uses configuration from:
- KM Style Guide (`../docs/km-style-guide.md`)
- Training data patterns
- Quality example analysis

Custom rules can be added in `src/rules/` following the existing pattern.

## Development

### Adding a New Rule

1. Add to appropriate rule file (`structural.js`, `formatting.js`, etc.)
2. Follow the rule structure:
```javascript
checkRuleName(context) {
  const issues = [];
  // ... rule logic
  issues.push({
    id: 'unique-rule-id',
    category: 'structural|formatting|content|technical',
    severity: 'error|warning|info',
    message: 'Issue description',
    line: lineNumber,
    suggestion: 'How to fix',
    fixable: true|false,
    safeFix: true|false,
    fix: {
      type: 'replace',
      from: 'old text',
      to: 'new text'
    }
  });
  return issues;
}
```

3. Add to `this.ruleSet` in constructor
4. Test with sample files

## Related Files

- `.claude/skills/km-review.md` - AI-powered review skill
- `../docs/km-style-guide.md` - KM standards reference
- `../prompts/km-doc-review.md` - Comprehensive review prompt
- `../training-data/` - Extracted feedback patterns

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0.
