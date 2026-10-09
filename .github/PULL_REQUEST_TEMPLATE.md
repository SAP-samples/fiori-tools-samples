# Pull Request

## What does this PR do?

<!-- Brief description of changes -->

## Checklist

- [ ] Sample tested and runs without errors
- [ ] No sensitive data included
- [ ] Documentation reviewed and validated (if README changes included)

## Documentation Validation

If your PR includes changes to README.md files, you can validate them locally before submitting:

```bash
# Check a specific README for issues
node docs-linter/src/cli.js check path/to/README.md

# Get quality score
node docs-linter/src/cli.js validate path/to/README.md

# Auto-fix safe issues
node docs-linter/src/cli.js fix path/to/README.md
```

The docs-linter checks for KM documentation standards including heading capitalization, list formatting, link phrasing, and technical accuracy.

