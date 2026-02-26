#!/bin/bash
# Setup Git Hooks for Branch Protection and Documentation Linting
# Run this script after cloning the repository to install Git hooks

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "🔧 Setting up Git hooks for fiori-tools-samples..."
echo ""

# Create the branch protection script
cat > "$HOOKS_DIR/check-branch-protection.sh" << 'EOF'
#!/bin/sh
# Branch Protection Script
# Prevents direct commits to protected branches (main, master)

BRANCH=$(git symbolic-ref HEAD 2>/dev/null | sed 's#refs/heads/##')
PROTECTED_BRANCHES="main master"

for protected in $PROTECTED_BRANCHES; do
  if [ "$BRANCH" = "$protected" ]; then
    echo ""
    echo "❌ ERROR: Direct commits to '$protected' branch are not allowed!"
    echo ""
    echo "To make changes:"
    echo "  1. Create a new feature branch:"
    echo "     git checkout -b feature/your-feature-name"
    echo ""
    echo "  2. Make your changes and commit them"
    echo ""
    echo "  3. Push your branch:"
    echo "     git push -u origin feature/your-feature-name"
    echo ""
    echo "  4. Create a Pull Request for review"
    echo ""
    echo "If you're already on main with changes:"
    echo "  git checkout -b feature/your-feature-name"
    echo "  (your changes will move to the new branch)"
    echo ""
    exit 1
  fi
done

exit 0
EOF

chmod +x "$HOOKS_DIR/check-branch-protection.sh"
echo "✅ Branch protection script installed"

# Create/update pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/sh
# Pre-commit Hook: Branch Protection + Documentation Linting

# First, check if we're trying to commit to a protected branch
. "$(dirname "$0")/check-branch-protection.sh"

echo "🔍 Running KM documentation checks..."

# Check README files for basic issues
README_FILES=$(git diff --cached --name-only | grep README.md)
if [ ! -z "$README_FILES" ]; then
  for file in $README_FILES; do
    if [ -f "$file" ]; then
      echo "Checking: $file"
      if [ -f "docs-linter/src/cli.js" ]; then
        node docs-linter/src/cli.js check "$file" --auto-fix-safe
      else
        echo "[docs-linter] check $file - SKIPPED (linter in development)"
      fi
    fi
  done
fi
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ Pre-commit hook installed"

# Create/update pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/sh
# Pre-push Hook: Branch Protection Warning + Documentation Validation

# Check if we're trying to push to a protected branch
BRANCH=$(git symbolic-ref HEAD 2>/dev/null | sed 's#refs/heads/##')
PROTECTED_BRANCHES="main master"

for protected in $PROTECTED_BRANCHES; do
  if [ "$BRANCH" = "$protected" ]; then
    echo ""
    echo "⚠️  WARNING: Attempting to push directly to '$protected' branch!"
    echo ""
    echo "Direct pushes to '$protected' are strongly discouraged."
    echo "Please create a feature branch and submit a Pull Request instead."
    echo ""
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Push cancelled. Create a feature branch instead:"
      echo "  git checkout -b feature/your-feature-name"
      exit 1
    fi
  fi
done

echo "📊 Running comprehensive KM documentation validation..."

README_FILES=$(find . -name "README.md" -type f | head -10)
for file in $README_FILES; do
  if [ -f "$file" ]; then
    if [ -f "docs-linter/src/cli.js" ]; then
      node docs-linter/src/cli.js validate "$file" --km-standards
    else
      echo "[docs-linter] validate $file - SKIPPED (linter in development)"
    fi
  fi
done
EOF

chmod +x "$HOOKS_DIR/pre-push"
echo "✅ Pre-push hook installed"

echo ""
echo "✨ Git hooks setup complete!"
echo ""
echo "Protected branches: main, master"
echo "  - Direct commits are blocked"
echo "  - Direct pushes require confirmation"
echo ""
echo "All changes must go through feature branches and Pull Requests."
echo ""
