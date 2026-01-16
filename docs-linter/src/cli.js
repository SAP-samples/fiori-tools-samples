#!/usr/bin/env node

/**
 * KM Feedback Training System - Documentation Linter CLI
 *
 * A standalone documentation linting system that learns from Knowledge Management
 * team feedback patterns to reduce PR review cycles and ensure consistent
 * documentation quality across the repository.
 */

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DocsLinter = require('./linter');
const TemplateGenerator = require('./template-generator');
const { loadTrainingData, loadRules } = require('./utils/data-loader');

program
  .name('docs-linter')
  .description('KM Feedback Training System - Documentation linter')
  .version('1.0.0');

// Check command - analyze files for issues
program
  .command('check')
  .description('Check documentation files for KM feedback patterns')
  .argument('[files...]', 'Files to check (default: README.md files)')
  .option('--auto-fix-safe', 'Automatically fix safe issues')
  .option('--comprehensive', 'Run comprehensive analysis')
  .option('--format <format>', 'Output format (json, table)', 'table')
  .action(async (files, options) => {
    try {
      console.log(chalk.blue('🔍 KM Documentation Linter - Check Mode\n'));

      const filesToCheck = files.length > 0 ? files : await findReadmeFiles();
      const linter = new DocsLinter();

      const results = [];
      for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
          console.log(chalk.gray(`Checking: ${file}`));
          const result = await linter.checkFile(file, {
            comprehensive: options.comprehensive,
            autoFixSafe: options.autoFixSafe
          });
          results.push(result);
        } else {
          console.log(chalk.red(`File not found: ${file}`));
        }
      }

      // Output results
      if (options.format === 'json') {
        console.log(JSON.stringify(results, null, 2));
      } else {
        displayResults(results);
      }

      // Exit with error code if issues found
      const hasErrors = results.some(r => r.issues.some(i => i.severity === 'error'));
      const hasWarnings = results.some(r => r.issues.some(i => i.severity === 'warning'));

      if (hasErrors) {
        process.exit(1);
      } else if (hasWarnings) {
        process.exit(0);
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Fix command - automatically fix issues
program
  .command('fix')
  .description('Fix documentation files based on KM feedback patterns')
  .argument('<file>', 'File to fix')
  .option('--safe-only', 'Only apply safe fixes')
  .option('--dry-run', 'Show changes without applying them')
  .action(async (file, options) => {
    try {
      console.log(chalk.blue(`🔧 KM Documentation Linter - Fix Mode\n`));

      if (!fs.existsSync(file)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }

      const linter = new DocsLinter();
      const result = await linter.fixFile(file, {
        safeOnly: options.safeOnly,
        dryRun: options.dryRun
      });

      if (result.changes.length > 0) {
        console.log(chalk.green(`✅ Applied ${result.changes.length} fixes to ${file}`));
        result.changes.forEach(change => {
          console.log(chalk.gray(`  - ${change.description}`));
        });
      } else {
        console.log(chalk.blue(`ℹ️  No fixes applied to ${file}`));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Validate command - validate against KM standards
program
  .command('validate')
  .description('Validate documentation against KM standards')
  .argument('<file>', 'File to validate')
  .option('--km-standards', 'Use KM team standards for validation')
  .action(async (file, options) => {
    try {
      console.log(chalk.blue('📊 KM Documentation Linter - Validate Mode\n'));

      if (!fs.existsSync(file)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }

      const linter = new DocsLinter();
      const result = await linter.validateFile(file, {
        useKMStandards: options.kmStandards
      });

      console.log(chalk.green(`📋 Validation Results for ${file}:`));
      console.log(chalk.gray(`Score: ${result.score}/100`));

      if (result.score >= 90) {
        console.log(chalk.green('🏆 Excellent! This documentation meets KM quality standards.'));
      } else if (result.score >= 75) {
        console.log(chalk.yellow('⚠️  Good, but could be improved with KM feedback patterns.'));
      } else {
        console.log(chalk.red('❌ Needs significant improvement to meet KM standards.'));
      }

      result.feedback.forEach(item => {
        const icon = item.type === 'error' ? '❌' : item.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${item.message}`);
      });

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Template command - generate from template
program
  .command('template')
  .description('Generate documentation from KM-approved templates')
  .option('--type <type>', 'Template type (sample-app, guide, api)', 'sample-app')
  .option('--output <file>', 'Output file', 'README.md')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📝 KM Documentation Template Generator\n'));

      const generator = new TemplateGenerator();
      const content = await generator.generate(options.type, {
        outputFile: options.output
      });

      fs.writeFileSync(options.output, content);
      console.log(chalk.green(`✅ Generated ${options.type} template: ${options.output}`));

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Install hooks command
program
  .command('install-hooks')
  .description('Install git hooks for automated validation')
  .action(() => {
    try {
      console.log(chalk.blue('🔧 Installing Git Hooks...\n'));

      const hookDir = '.git/hooks';
      if (!fs.existsSync(hookDir)) {
        console.error(chalk.red('❌ Not in a git repository'));
        process.exit(1);
      }

      // Pre-commit hook
      const preCommitHook = `#!/bin/sh
# KM Documentation Linter Pre-commit Hook
echo "🔍 Running KM documentation checks..."

# Check README files for basic issues
README_FILES=$(git diff --cached --name-only | grep README.md)
if [ ! -z "$README_FILES" ]; then
  for file in $README_FILES; do
    if [ -f "$file" ]; then
      echo "Checking: $file"
      node docs-linter/src/cli.js check "$file" --auto-fix-safe
    fi
  done
fi`;

      fs.writeFileSync(path.join(hookDir, 'pre-commit'), preCommitHook, { mode: 0o755 });

      // Pre-push hook
      const prePushHook = `#!/bin/sh
# KM Documentation Linter Pre-push Hook
echo "📊 Running comprehensive KM documentation validation..."

README_FILES=$(find . -name "README.md" -type f | head -10)
for file in $README_FILES; do
  if [ -f "$file" ]; then
    node docs-linter/src/cli.js validate "$file" --km-standards
  fi
done`;

      fs.writeFileSync(path.join(hookDir, 'pre-push'), prePushHook, { mode: 0o755 });

      console.log(chalk.green('✅ Git hooks installed successfully!'));
      console.log(chalk.gray('  - pre-commit: Basic KM checks with auto-fix'));
      console.log(chalk.gray('  - pre-push: Comprehensive validation'));

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Utility functions
async function findReadmeFiles() {
  try {
    const files = await glob('**/README.md', {
      ignore: ['node_modules/**', '.git/**', 'docs-linter/**']
    });
    return files;
  } catch (error) {
    return ['README.md'];
  }
}

function displayResults(results) {
  let totalIssues = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  results.forEach(result => {
    const { file, issues } = result;

    if (issues.length > 0) {
      console.log(chalk.bold(`\n📄 ${file}:`));

      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? chalk.red('❌') :
                    issue.severity === 'warning' ? chalk.yellow('⚠️') :
                    chalk.blue('ℹ️');

        console.log(`  ${icon} ${issue.message}`);

        if (issue.suggestion) {
          console.log(chalk.gray(`     💡 Suggestion: ${issue.suggestion}`));
        }

        if (issue.line) {
          console.log(chalk.gray(`     📍 Line ${issue.line}`));
        }
      });

      totalIssues += issues.length;
      totalErrors += issues.filter(i => i.severity === 'error').length;
      totalWarnings += issues.filter(i => i.severity === 'warning').length;
    }
  });

  // Summary
  console.log(chalk.bold('\n📋 Summary:'));
  console.log(`  Files checked: ${results.length}`);
  console.log(`  Total issues: ${totalIssues}`);
  if (totalErrors > 0) {
    console.log(chalk.red(`  Errors: ${totalErrors}`));
  }
  if (totalWarnings > 0) {
    console.log(chalk.yellow(`  Warnings: ${totalWarnings}`));
  }

  if (totalIssues === 0) {
    console.log(chalk.green('🎉 All files passed KM documentation standards!'));
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Run the program
if (require.main === module) {
  program.parse();
}

module.exports = program;