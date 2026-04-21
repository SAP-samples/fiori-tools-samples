# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

A collection of SAP Fiori Tools sample applications organized by technology (OData V2, V4, CAP, tutorials). Samples are referenced in SAP tutorials, blogs, and documentation. Most work in this repo is documentation, CI/CD, and tooling — not application code.

## Common Commands

### Markdown Linting
```bash
npm run lint:md              # Check all markdown files
npm run lint:md:fix          # Auto-fix markdown issues
./scripts/lint-markdown.sh <file>  # Check a specific file
```

### docs-linter (KM documentation standards)
```bash
node docs-linter/src/cli.js validate <file>            # Validate a file
node docs-linter/src/cli.js validate <file> --json     # JSON output
node docs-linter/src/cli.js check <file> --auto-fix-safe  # Auto-fix safe issues
```

### Git Hooks Setup
```bash
./scripts/setup-git-hooks.sh  # Install pre-commit and pre-push hooks
```

### Per-Sample Commands
Each sample has its own `package.json`. Common patterns:
```bash
npm start    # Start with mock data (UI5 apps)
npm run build  # Build/compile
npm run deploy  # Deploy to Cloud Foundry (CAP apps)
```

## Branch & PR Conventions

- **Protected branches:** `main`, `master` — no direct pushes
- **Branch naming prefixes:** `feature/`, `bugfix/`, `fix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`, `test/`, `enhancement/`, `km-`
- **Commit messages:** Conventional commits style (e.g., `docs:`, `chore:`, `ci:`, `fix:`)
- **PR titles:** Minimum 10 characters; no WIP prefix when ready

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `pr-validation.yml` | PRs to main | Branch naming, PR title, merge conflicts, commit messages. Skips PR size check for docs/image-only changes. |
| `link-checker.yml` | PRs affecting `.md` files | Lychee link validation (non-blocking) |
| `codeql.yml` | PRs to main, weekly | JavaScript security scan — skips for `.md` and image-only changes |
| `branch-protection.yml` | Push to main | Prevents direct commits |

The `detect-changes` job in `pr-validation.yml` sets a `docs-only` flag when only `.md` and image files (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`) are changed, which skips code-specific checks.

## Documentation Standards (KM Rules)

Applied via the `/km-review` skill and `docs-linter`:

- **H1/H2/H3:** Title case (Chicago style)
- **H4+:** Sentence case
- **List markers:** Dashes (`-`) preferred over asterisks
- **Em dashes (`—`) or arrows (`→`) in list items:** Replace with colons
- **Terminology:** `back-end` (not `backend`), `using Cloud Connector` (not `via`), `works` (not `is working`)
- **HTTP error pairs:** `HTTP 401 and HTTP 403` (not `HTTP 401/403`)
- **ToC label:** "Table of Contents"
- **Oxford commas** and **number formatting** enforced

## Architecture Notes

- **No monorepo tooling** — each sample is independently runnable with its own `package.json`
- **`docs-linter/`** is on the `km-updates` branch and not yet merged to `main` (only `src/cli.js` was accidentally committed to main and since removed)
- **`.claude/skills/`** contains two custom skills: `km-review.md` (documentation QA) and `customer-tone.md`
- **CAP samples** use MTA format for deployment and include `xs-security.json`, `xs-app.json`, and `mta.yaml`
- **`REUSE.toml`** manages SPDX license compliance across all files
- **Copyright header:** `Copyright (c) 2009-2026 SAP SE or an SAP affiliate company`
