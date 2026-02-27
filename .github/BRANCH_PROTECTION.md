# Branch Protection Setup Guide

This guide explains how to configure branch protection rules for the `main` branch to enforce pull request workflows and prevent direct commits.

## Why Branch Protection?

Branch protection ensures:
- ✅ All changes go through pull requests and code review
- ✅ Automated tests and checks pass before merging
- ✅ Prevents accidental direct commits to main
- ✅ Maintains a clean, reviewable commit history
- ✅ Enables better collaboration and quality control

## Quick Setup (GitHub UI)

### Step 1: Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click on **Settings** (top right)
3. In the left sidebar, click **Branches** (under "Code and automation")
4. Under "Branch protection rules", click **Add branch protection rule**

### Step 2: Configure the Rule

**Branch name pattern:**
```
main
```

**Recommended Settings:**

#### Protect matching branches
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (adjust based on team size)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)
  - ⬜ Restrict who can dismiss pull request reviews (optional)
  - ⬜ Allow specified actors to bypass required pull requests (optional)
  - ⬜ Require approval of the most recent reviewable push

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Select required status checks:
    - `link-check` (Link Checker workflow)
    - `validate-pr` (PR Validation workflow)
    - `markdown-link-check` (Markdown Link Check workflow)
    - Any other CI/CD checks you add

- ✅ **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

- ✅ **Require signed commits** (optional but recommended)
  - Ensures commits are cryptographically signed

- ✅ **Require linear history** (optional)
  - Prevents merge commits, enforces rebase or squash merging

- ⬜ **Require deployments to succeed before merging** (if you have deployments)

#### Rules applied to everyone including administrators
- ✅ **Do not allow bypassing the above settings**
  - Ensures even admins follow the process

- ✅ **Restrict who can push to matching branches**
  - Leave empty to block all direct pushes
  - Or add specific users/teams who can push (not recommended)

- ⬜ Allow force pushes (NOT recommended for main)
- ⬜ Allow deletions (NOT recommended for main)

### Step 3: Save Changes

Click **Create** or **Save changes** at the bottom of the page.

## Configuration Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Login to GitHub
gh auth login

# Create branch protection rule
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["link-check","validate-pr"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_conversation_resolution=true \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Configuration Using Terraform

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = ["link-check", "validate-pr", "markdown-link-check"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
    required_approving_review_count = 1
  }

  enforce_admins                  = true
  require_conversation_resolution = true
  require_signed_commits          = false
  required_linear_history         = false

  allows_deletions    = false
  allows_force_pushes = false
}
```

## Workflow After Protection is Enabled

### For Contributors

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   ```bash
   # Edit files
   git add .
   git commit -m "Add descriptive commit message"
   ```

3. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request:**
   - Go to GitHub
   - Click "Compare & pull request"
   - Fill in title and description
   - Add labels (bug, enhancement, documentation, etc.)
   - Request reviewers
   - Submit the PR

5. **Wait for checks:**
   - All required status checks must pass
   - Address any review comments
   - Make additional commits if needed

6. **Merge:**
   - Once approved and checks pass, merge the PR
   - Choose merge strategy:
     - **Squash and merge** (recommended for clean history)
     - **Rebase and merge** (for linear history)
     - **Create a merge commit** (preserves branch history)

7. **Clean up:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

### Branch Naming Conventions

Use these prefixes for your branches:

- `feature/` - New features
- `bugfix/` or `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks
- `enhancement/` - Improvements to existing features

**Examples:**
```
feature/add-user-authentication
bugfix/fix-login-redirect
docs/update-readme
refactor/improve-error-handling
```

## What Happens if Someone Tries to Push to Main?

### With Branch Protection Enabled (GitHub Settings)
```bash
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To github.com:SAP-samples/fiori-tools-samples.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'github.com:SAP-samples/fiori-tools-samples.git'
```

### With GitHub Actions Workflow Only
If branch protection isn't enabled but the workflow is, the push will succeed initially but the workflow will fail and create a notification.

## Protecting Multiple Branches

You can create additional protection rules for:
- `master` (if using both main and master)
- `develop` (if using Gitflow workflow)
- `release/*` (for release branches)
- `hotfix/*` (for hotfix branches)

## Troubleshooting

### "I accidentally committed to main locally, how do I fix it?"

```bash
# Create a new branch with your changes
git branch feature/your-fix

# Reset main to match remote
git checkout main
git fetch origin
git reset --hard origin/main

# Push your branch and create a PR
git checkout feature/your-fix
git push origin feature/your-fix
```

### "The status checks are required but don't exist"

If you require status checks that haven't run yet:
1. Create a test PR to trigger all workflows
2. After they run once, they'll appear in the branch protection settings
3. Add them to required status checks

### "I need to make an emergency fix"

Options:
1. **Best practice:** Create a hotfix branch and fast-track the PR with expedited review
2. **Temporary bypass:** If you're an admin, you can temporarily disable branch protection (not recommended)
3. **Service account:** Create a service account with bypass permissions for automated releases (carefully controlled)

## Monitoring and Auditing

### View Protection Status
```bash
gh api repos/:owner/:repo/branches/main/protection
```

### View Protection History
1. Go to **Settings** → **Branches**
2. Click on the protection rule
3. View "Recent events" at the bottom

### Audit Log
1. Go to **Settings** → **Audit log**
2. Filter by "protected_branch" events

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CLI Branch Protection](https://cli.github.com/manual/gh_api)
- [Best Practices for Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)

## Summary Checklist

- [ ] Enable branch protection for `main`
- [ ] Require pull request reviews (at least 1 approval)
- [ ] Require status checks to pass
- [ ] Enable "Require branches to be up to date before merging"
- [ ] Require conversation resolution
- [ ] Do not allow bypassing settings
- [ ] Restrict direct pushes to matching branches
- [ ] Disable force pushes and deletions
- [ ] Document workflow for team members
- [ ] Train team on new process
- [ ] Test with a practice PR

---

**Note:** Branch protection rules require appropriate repository permissions. You must be a repository administrator or have the "Manage branch protection rules" permission to configure these settings.
