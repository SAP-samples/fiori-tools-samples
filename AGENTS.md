# `AGENTS.md`

This file is the single source of truth for all agents working in this repository.

## Repository Purpose

A collection of SAP Fiori Tools sample applications organized by technology (OData V2, V4, CAP, tutorials). Samples are referenced in SAP tutorials, blogs, and documentation. Most work in this repo is documentation, CI/CD, and tooling — not application code.

## Agent Behavior

- Think before coding: state assumptions, surface tradeoffs, ask when uncertain
- Make surgical changes: touch only what the task requires
- Preserve existing behavior unless the task explicitly requires a change
- Run the smallest relevant validation before reporting completion
- Clearly state what changed, what was tested, and what was not tested

## Common Commands

### Markdown Linting

```bash
npm run lint:md              # Check all markdown files
npm run lint:md:fix          # Auto-fix markdown issues
./scripts/lint-markdown.sh <file>  # Check a specific file
```

### Git Hooks Setup

```bash
./scripts/setup-git-hooks.sh  # Install pre-commit and pre-push hooks
```

### Per-Sample Commands

Each sample has its own `package.json`. Common patterns:

```bash
npm start       # Start with mock data (UI5 apps)
npm run build   # Build/compile
npm run deploy  # Deploy to Cloud Foundry (CAP apps)
```

## Branch and PR Conventions

**`main` is a protected branch. Never push directly to `main`. Every change must go through a pull request — no exceptions.**

- **Branch naming prefixes:** `feature/`, `bugfix/`, `fix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`, `test/`, `enhancement/`, `km-`
- **Commit messages:** Conventional commits style (e.g., `docs:`, `chore:`, `ci:`, `fix:`)
- **PR titles:** Minimum 10 characters; no WIP prefix when ready
- **PR assignee:** Always assign the PR to the person who created it immediately after `gh pr create`, using the REST API: `gh api repos/SAP-samples/fiori-tools-samples/issues/<number>/assignees -X POST -f 'assignees[]=<github-username>'`

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `pr-validation.yml` | PRs to main | Branch naming, PR title, merge conflicts, commit messages. Skips PR size check for docs/image-only changes. |
| `link-checker.yml` | PRs affecting `.md` files | Lychee link validation (non-blocking) |
| `codeql.yml` | PRs to main, weekly | JavaScript security scan — skips for `.md` and image-only changes |
| `branch-protection.yml` | Push to main | Prevents direct commits |

The `detect-changes` job in `pr-validation.yml` sets a `docs-only` flag when only `.md` and image files (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`) are changed, which skips code-specific checks.

## Running KM Review

Before raising a PR for any `.md` file change, validate the file against KM standards using the `/km-review` skill:

```text
/km-review <file-path>           # review a specific file
/km-review --latest              # review .md files changed in the latest commit
/km-review --latest --fix        # review and apply safe fixes
```

To automatically apply safe fixes:

```text
/km-review <file-path> --fix
```

The skill runs markdown linting and an AI review against the KM rules defined in `prompts/km-doc-review.md` and `docs/km-style-guide.md`. Address all critical and major findings before opening a PR.

For automated rule-based checks outside Claude Code, the `docs-linter/` tool can be run directly:

```bash
node docs-linter/src/cli.js check <file>      # check a file
node docs-linter/src/cli.js fix <file> --safe-only  # apply safe auto-fixes
node docs-linter/src/cli.js validate <file>   # quality score and recommendations
```

See `docs-linter/README.md` for full usage.

## Documentation Standards (KM Rules)

Applied using the `/km-review` skill and `prompts/km-doc-review.md`. Full rules in `docs/km-style-guide.md`. Key rules:

- **All headings (H1–H6):** Chicago title case — capitalize all major words including participles ("Using", "Running"); lowercase articles, prepositions of four or fewer letters (including "with"), and coordinating conjunctions, unless first or last word
- **Headings must not end** with a colon or question mark
- **License heading:** Always `## License` (H2), never H3 or lower
- **Prerequisites bullets:** Each must start with "You have" or "You are"
- **Step/Issue prefixes:** Do not use "Step N:" or "Issue N:" as heading prefixes — use descriptive headings
- **List markers:** Dashes (`-`) over asterisks; single-item ordered lists must be bullets or prose
- **Em dashes (`—`) or arrows (`→`) in list items:** Replace with colons
- **No semicolons in prose** — use colon or period instead
- **Do not state list item count in prose** — use "the following" without a number
- **Terminology:** `on-premise` (not `onpremise`), `Cloud Connector` (consistent caps), `SAP BTP` (not just `BTP`)
- **HTTP error pairs:** `HTTP 401 and HTTP 403` (not `HTTP 401/403`)
- **ToC label:** "Table of Contents"
- **Oxford commas** and **number formatting** enforced (spell out one–ten in prose)

## Keeping Docs in Sync

Whenever a sample is added, removed, or moved in a subdirectory, update **both** of the following before raising a PR:

- **`SAMPLES_INDEX.md`** — add, remove, or update the row for the affected sample (name, description, path)
- **`README.md`** — update the Overview table or Quick Start section if the change affects a top-level category

This applies to any change under `V2/`, `V4/`, `cap/`, `thirdpartylibrary/`, `sample-fiori-gen-ext/`, `neo-migration/`, or `misc/`.

## Architecture Notes

- **No monorepo tooling** — each sample is independently runnable with its own `package.json`
- **`.claude/skills/`** contains one custom skill: `km-review/` (documentation QA)
- **`prompts/km-doc-review.md`** contains the full KM review prompt used by the `km-review` skill
- **CAP samples** use MTA format for deployment and include `xs-security.json`, `xs-app.json`, and `mta.yaml`
- **`REUSE.toml`** manages SPDX license compliance across all files
- **Copyright header:** `Copyright (c) 2009-2026 SAP SE or an SAP affiliate company`
