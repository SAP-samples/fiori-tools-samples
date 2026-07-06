# fiori-tools-samples

## Available Skills

### `/km-review` — KM Documentation Review

Audits Markdown files against SAP KM standards.

```
/km-review <file-path> [--fix]
/km-review --latest [--fix]
```

- `<file-path>` — review a specific `.md` file
- `--latest` — review `.md` files changed in the latest commit (or staged changes)
- `--fix` — apply safe mechanical fixes after review

Uses `prompts/km-doc-review.md` and `docs/km-style-guide.md` as rule sources.
