# Branch Protection

This repository enforces branch protection through Git hooks to prevent direct commits to protected branches.

## Protected Branches

- `main`
- `master`

## Protection Mechanisms

### 1. Pre-commit Hook
Blocks commits directly to protected branches with an error message.

### 2. Pre-push Hook
Warns when attempting to push to protected branches and requires explicit confirmation.

## Workflow Requirements

All changes must follow this workflow:

1. **Create a feature branch** from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Push your branch**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub for review

## Setup for Contributors

After cloning the repository, run the setup script to install Git hooks:

```bash
./scripts/setup-git-hooks.sh
```

This will install:
- Branch protection checks
- Documentation linting hooks

## What If I'm Already on Main?

If you've made changes on the main branch by mistake:

```bash
# Create a new branch (your changes will move with you)
git checkout -b feature/your-feature-name

# Now you can commit your changes
git add .
git commit -m "Your commit message"

# Push the new branch
git push -u origin feature/your-feature-name
```

## Branch Naming Conventions

Use descriptive branch names with prefixes:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

Examples:
- `feature/add-ui5-sample`
- `fix/destination-config`
- `docs/update-readme`
- `refactor/modernize-mta-sample`

## Bypassing Protection (Emergency Only)

In rare cases where direct commit/push to main is absolutely necessary:

### Skip pre-commit hook:
```bash
git commit --no-verify -m "Emergency fix"
```

### Confirm pre-push warning:
When prompted, type `y` to confirm the push.

⚠️ **Warning:** Only use bypass in emergencies. All standard changes must go through PR review.

## GitHub Branch Protection Rules

In addition to local Git hooks, consider enabling GitHub branch protection rules:

1. Go to repository **Settings** → **Branches**
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators (optional)

## Troubleshooting

### Hook not running
If the Git hook isn't working:
```bash
# Re-run the setup script
./scripts/setup-git-hooks.sh

# Check hook permissions
ls -l .git/hooks/pre-commit
ls -l .git/hooks/pre-push

# Make sure they're executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

### Hook blocking legitimate work
If you believe the hook is incorrectly blocking your work, please:
1. Create an issue describing the scenario
2. Use `--no-verify` only as a temporary workaround
3. Document why the bypass was necessary in your commit message

## Support

For questions or issues with branch protection:
- Check this documentation
- Review `.git/hooks/pre-commit` and `.git/hooks/pre-push`
- Open an issue if you encounter problems
