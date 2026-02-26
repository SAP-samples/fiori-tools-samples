# GitHub Repository Branch Protection Setup

This guide explains how to configure branch protection rules on GitHub to prevent direct commits to the main branch at the repository level.

## Overview

While Git hooks provide local protection, **GitHub Branch Protection Rules** enforce protection at the repository level, applying to all contributors regardless of their local setup.

## Setting Up Branch Protection

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub: https://github.com/SAP-samples/fiori-tools-samples
2. Click **Settings** (requires admin/maintainer permissions)
3. In the left sidebar, click **Branches**
4. Under "Branch protection rules", click **Add rule** or **Add branch protection rule**

### 2. Configure Protection Rule

#### Branch Name Pattern
```
main
```

#### Recommended Settings

**Protect matching branches:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1 (or more)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional, if using CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Select specific status checks if you have CI/CD pipelines

- ✅ **Require conversation resolution before merging**
  - All review comments must be resolved

- ✅ **Require signed commits** (optional but recommended)
  - Ensures commits are verified

- ✅ **Require linear history** (optional)
  - Prevents merge commits, enforces rebase or squash

- ✅ **Include administrators**
  - ⚠️ Applies rules to repository administrators too
  - Recommended for consistency

- ✅ **Restrict who can push to matching branches**
  - Select specific users/teams who can push (if needed)
  - For most projects, leave this empty to block all direct pushes

- ✅ **Allow force pushes: Disabled**
  - Prevents force pushes that could overwrite history

- ✅ **Allow deletions: Disabled**
  - Prevents accidental deletion of main branch

### 3. Save Changes

Click **Create** or **Save changes** at the bottom of the page.

## Verification

After setting up, try to push directly to main:

```bash
git checkout main
echo "test" > test.txt
git add test.txt
git commit -m "Test direct commit"
git push origin main
```

You should see an error like:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

## Additional Protection Layers

### 1. Required Status Checks

If you have CI/CD workflows (GitHub Actions, Jenkins, etc.):
- Add them as required status checks
- Prevents merging if tests fail

### 2. CODEOWNERS File

Create `.github/CODEOWNERS` to automatically request reviews:

```
# Global owners
*       @your-team

# Specific paths
/docs/  @documentation-team
/misc/  @infrastructure-team
```

### 3. Required Reviewers

Configure specific teams or individuals who must approve:
- Go to Settings → Branches → Edit rule
- Under "Require pull request reviews before merging"
- Add required reviewers or code owner review

## Multi-Branch Protection

To protect multiple branches, create separate rules:

### Protect all release branches
Branch name pattern: `release/*`

### Protect master (if used)
Branch name pattern: `master`

## Enforcement Hierarchy

Branch protection works in layers:

1. **GitHub Branch Protection** (strongest) - Enforced server-side
2. **Local Git Hooks** - Enforced client-side (can be bypassed)
3. **Developer discipline** (weakest) - No enforcement

For maximum protection, use both GitHub rules AND local hooks.

## Troubleshooting

### "You don't have permission to configure branch protection"

You need repository admin or maintainer access. Contact:
- Repository owner
- Organization admin
- Team with admin permissions

### "Rules not applying to me as admin"

If you're an admin and rules aren't applying:
- Check if "Include administrators" is enabled
- This setting is intentionally disabled by default for admins

### "Status checks not showing up"

Required status checks must:
- Have run at least once on the branch
- Be configured in your CI/CD pipeline
- Match the exact name of the check

## Best Practices

### Minimum Protection (Recommended)
- ✅ Require pull request before merging
- ✅ Require at least 1 approval
- ✅ Require branches to be up to date
- ✅ Include administrators

### Standard Protection
- All Minimum settings, plus:
- ✅ Require status checks (CI/CD)
- ✅ Require conversation resolution
- ✅ Require signed commits

### Maximum Protection
- All Standard settings, plus:
- ✅ Restrict push access to specific users
- ✅ Require linear history
- ✅ Require code owner review

## Compliance and Audit

GitHub provides audit logs for:
- Branch protection rule changes
- Bypass attempts
- Force push attempts
- Direct push attempts

Access via: Settings → Security → Audit log

## Emergency Procedures

### Hotfix to Production

For urgent fixes when branch protection blocks progress:

**Option 1: Admin Override** (if enabled)
- Admin can merge without review (not recommended)

**Option 2: Fast-track PR**
1. Create emergency branch: `hotfix/critical-issue`
2. Make fix and push
3. Create PR with `[URGENT]` prefix
4. Request immediate review
5. Merge after approval

**Option 3: Temporarily Disable** (last resort)
1. Settings → Branches → Edit rule
2. Temporarily disable specific requirements
3. Make emergency change
4. **Immediately re-enable** protection

⚠️ Document all emergency overrides in incident reports.

## Additional Resources

- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

## Quick Setup Checklist

- [ ] Navigate to repository Settings → Branches
- [ ] Add rule for `main` branch
- [ ] Enable "Require a pull request before merging"
- [ ] Set required approvals to 1+
- [ ] Enable "Require branches to be up to date"
- [ ] Enable "Include administrators"
- [ ] Disable "Allow force pushes"
- [ ] Disable "Allow deletions"
- [ ] Click "Create" or "Save changes"
- [ ] Test by attempting direct push to main
- [ ] Document the configuration
- [ ] Notify team members

## Support

For assistance with GitHub branch protection:
- Check GitHub's documentation
- Contact repository administrators
- Review audit logs for issues
- Open an issue if protection is blocking legitimate work
