# GitHub Actions Workflows

This directory contains automated workflows for the fiori-tools-samples repository.

## Available Workflows

### 1. Branch Protection
**File:** `branch-protection.yml`

**Purpose:** Prevents direct commits to the main/master branch and enforces pull request workflow.

**When it runs:**
- On every push to `main` or `master` branches
- Validates that the push came from a merged PR, not a direct commit

**Features:**
- Detects and blocks direct pushes to main
- Allows merges from pull requests
- Allows automated bot merges (dependabot, github-actions)
- Provides clear error messages with remediation steps
- Works as a safety net alongside GitHub branch protection rules

**Note:** This workflow complements but doesn't replace GitHub's branch protection rules. See [BRANCH_PROTECTION.md](../BRANCH_PROTECTION.md) for full setup instructions.

### 2. PR Validation
**File:** `pr-validation.yml`

**Purpose:** Validates pull requests to ensure quality and consistency.

**When it runs:**
- When a PR is opened, updated, or edited
- On PRs targeting `main` or `master` branches

**Features:**
- Validates branch naming conventions (feature/, bugfix/, fix/, etc.)
- Checks PR title length and quality
- Detects merge conflicts
- Validates commit messages
- Warns about large PRs that should be split
- Checks for PR labels

### 3. Link Checker (Primary)
**File:** `link-checker.yml`

**Purpose:** Validates all external HTTP/HTTPS links in markdown and JSON files on pull requests.

**When it runs:**
- On pull requests to `main` or `km-updates` branches
- When markdown files, JSON files, or files in `docs/` or `training-data/` are modified
- Manually via workflow dispatch

**Features:**
- Uses [Lychee](https://github.com/lycheeverse/lychee) - a fast, async link checker
- Excludes node_modules, .git, and placeholder URLs
- Accepts common redirect status codes (301, 302, 307, 308)
- Retries failed requests up to 3 times
- Posts a comment on the PR if broken links are found

**Configuration:** `.github/lychee.toml`

### 4. Markdown Link Check (Backup)
**File:** `markdown-link-check.yml`

**Purpose:** Alternative link checker focused specifically on markdown files.

**When it runs:**
- On pull requests to `main` or `km-updates` branches (when markdown files change)
- Weekly on Mondays at 9:00 AM UTC (scheduled scan)
- Manually via workflow dispatch

**Features:**
- Uses [markdown-link-check](https://github.com/tcort/markdown-link-check)
- Checks only modified files on PRs
- Weekly full repository scan
- Custom retry logic for rate-limited endpoints

**Configuration:** `.github/markdown-link-check-config.json`

## Configuration Files

### lychee.toml
Advanced configuration for the Lychee link checker:
- Excludes placeholder URLs (localhost, *.dest, internal hosts)
- Sets timeout and retry parameters
- Configures user-agent headers
- Caches results for 24 hours

### markdown-link-check-config.json
Configuration for markdown-link-check:
- Ignore patterns for placeholder URLs
- Custom headers for SAP and NPM domains
- Retry configuration for rate-limited sites
- Accepted HTTP status codes

## Known Exclusions

The workflows exclude the following URLs and files from validation:

### Excluded URLs
- **Local development URLs:** localhost, 127.0.0.1
- **Placeholder URLs:** `*.dest`, `my-internal-host`, `<destination-name>`
- **Schema URLs:** Any URL containing `/schema/*.json` or `/schema/*.yaml` (used for IDE validation, not meant to be accessed via HTTP)
- **$schema references:** Any URL containing `$schema` (JSON/YAML schema definitions)
- **Internal registries:** `https://int.repositories.cloud.sap` (requires authentication)
- **NPM package tarballs:** Direct .tgz download links in package-lock.json

### Excluded Files
- **YAML files:** `*.yaml`, `*.yml` files are excluded entirely (often contain schema URLs that aren't meant to be validated)
- **Node modules:** All `node_modules/` directories
- **Git directory:** `.git/` folder
- **Package lock files:** `package-lock.json` files (contain npm registry URLs)

## Testing the Workflows

### Test Locally (Lychee)
```bash
# Install lychee
brew install lychee  # macOS
# or
cargo install lychee  # Using Rust

# Run link check
lychee --config .github/lychee.toml '**/*.md'
```

### Test Locally (markdown-link-check)
```bash
# Install markdown-link-check
npm install -g markdown-link-check

# Check a single file
markdown-link-check README.md -c .github/markdown-link-check-config.json

# Check all markdown files
find . -name "*.md" -not -path "*/node_modules/*" -exec markdown-link-check {} -c .github/markdown-link-check-config.json \;
```

### Test on GitHub
1. Create a test branch
2. Add or modify a markdown file with a broken link
3. Create a pull request
4. The workflow will run automatically and report results

## Troubleshooting

### False Positives
If a valid URL is being flagged as broken:
1. Check if it requires authentication or has regional restrictions
2. Add it to the exclusion list in `lychee.toml` or `markdown-link-check-config.json`
3. Verify the site isn't temporarily down

### Rate Limiting
If you encounter rate limiting (HTTP 429):
- The workflows are configured to retry with backoff
- Some sites (like NPM, SAP Community) may require custom user-agent headers
- Consider adding delays between requests in the configuration

### Workflow Permissions
If the workflow cannot comment on PRs:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Enable **Allow GitHub Actions to create and approve pull requests**

## Maintenance

- Review and update exclusion patterns periodically
- Check for updates to the GitHub Actions used
- Monitor the weekly scan results for new broken links
- Update timeout/retry settings based on typical response times

## Additional Resources

- [Lychee Documentation](https://github.com/lycheeverse/lychee)
- [markdown-link-check Documentation](https://github.com/tcort/markdown-link-check)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
