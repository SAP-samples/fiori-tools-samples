#!/usr/bin/env node
/**
 * KM Documentation Linter CLI
 * Comprehensive markdown linting based on KM feedback patterns
 */

import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import DocsLinter from './linter.js';

// Initialize linter
const linter = new DocsLinter();

// CLI Configuration
program
  .name('docs-linter')
  .description('KM Documentation Linter - Apply Knowledge Management standards to markdown files')
  .version('1.0.0');

// Check command
program
  .command('check <file>')
  .description('Check a file for KM standards violations')
  .option('--json', 'Output results as JSON')
  .option('--comprehensive', 'Run comprehensive checks (slower but more thorough)')
  .action(async (file, options) => {
    try {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }

      if (!filePath.endsWith('.md')) {
        console.error(chalk.red('Error: Only markdown files (.md) are supported'));
        process.exit(1);
      }

      console.log(chalk.blue(`Checking ${path.basename(filePath)}...`));

      const result = await linter.checkFile(filePath, {
        comprehensive: options.comprehensive || false
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayCheckResults(result);
      }

      // Exit with error code if critical issues found
      const hasCritical = result.issues.some(i => i.severity === 'error');
      process.exit(hasCritical ? 1 : 0);

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Fix command
program
  .command('fix <file>')
  .description('Fix issues in a file automatically')
  .option('--dry-run', 'Show what would be fixed without applying changes')
  .option('--safe-only', 'Only apply fixes marked as safe')
  .action(async (file, options) => {
    try {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }

      console.log(chalk.blue(`${options.dryRun ? 'Analyzing' : 'Fixing'} ${path.basename(filePath)}...`));

      const result = await linter.fixFile(filePath, {
        dryRun: options.dryRun || false,
        safeOnly: options.safeOnly || false
      });

      if (options.dryRun) {
        console.log(chalk.yellow('\nDry run - no changes applied\n'));
        displayFixPreview(result);
      } else {
        displayFixResults(result);
      }

      process.exit(0);

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <file>')
  .description('Validate a file and provide quality score')
  .option('--json', 'Output results as JSON')
  .action(async (file, options) => {
    try {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found: ${filePath}`));
        process.exit(1);
      }

      console.log(chalk.blue(`Validating ${path.basename(filePath)}...`));

      const result = await linter.validateFile(filePath);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayValidationResults(result);
      }

      process.exit(0);

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Display functions

function displayCheckResults(result) {
  const { file, issues, summary } = result;

  console.log('\n' + chalk.bold('Results:'));
  console.log(`  Total issues: ${summary.total}`);
  console.log(`  ${chalk.red('Errors:')} ${summary.errors}`);
  console.log(`  ${chalk.yellow('Warnings:')} ${summary.warnings}`);
  console.log(`  ${chalk.blue('Info:')} ${summary.info}`);
  console.log(`  ${chalk.green('Auto-fixable:')} ${summary.fixable}`);

  if (summary.total === 0) {
    console.log(chalk.green('\n✓ No issues found!'));
    return;
  }

  // Group by category
  const byCategory = {
    structural: issues.filter(i => i.category === 'structural'),
    formatting: issues.filter(i => i.category === 'formatting'),
    content: issues.filter(i => i.category === 'content'),
    technical: issues.filter(i => i.category === 'technical')
  };

  Object.entries(byCategory).forEach(([category, categoryIssues]) => {
    if (categoryIssues.length === 0) return;

    console.log(chalk.bold(`\n${category.toUpperCase()} (${categoryIssues.length}):`));

    categoryIssues.slice(0, 10).forEach(issue => {
      const icon = getSeverityIcon(issue.severity);
      const line = issue.line ? chalk.gray(` (line ${issue.line})`) : '';
      console.log(`  ${icon} ${issue.message}${line}`);
      if (issue.suggestion) {
        console.log(chalk.gray(`     → ${issue.suggestion}`));
      }
    });

    if (categoryIssues.length > 10) {
      console.log(chalk.gray(`     ... and ${categoryIssues.length - 10} more`));
    }
  });

  if (summary.fixable > 0) {
    console.log(chalk.green(`\n${summary.fixable} issues can be fixed automatically with: docs-linter fix ${path.basename(file)}`));
  }
}

function displayFixResults(result) {
  const { file, changes, applied } = result;

  if (changes.length === 0) {
    console.log(chalk.green('\n✓ No fixable issues found!'));
    return;
  }

  console.log(chalk.bold(`\n${applied ? 'Applied' : 'Would apply'} ${changes.length} fixes:\n`));

  const byType = {};
  changes.forEach(change => {
    byType[change.type] = (byType[change.type] || 0) + 1;
  });

  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${chalk.green('✓')} ${type}: ${count} fix${count > 1 ? 'es' : ''}`);
  });

  if (applied) {
    console.log(chalk.green(`\n✓ Changes applied to ${path.basename(file)}`));
    console.log(chalk.gray('  Review with: git diff ' + path.basename(file)));
  }
}

function displayFixPreview(result) {
  const { changes } = result;

  if (changes.length === 0) {
    console.log(chalk.green('✓ No fixable issues found!'));
    return;
  }

  console.log(chalk.bold(`Would fix ${changes.length} issues:\n`));

  changes.slice(0, 15).forEach(change => {
    console.log(`  ${chalk.yellow('~')} ${change.description}`);
  });

  if (changes.length > 15) {
    console.log(chalk.gray(`     ... and ${changes.length - 15} more`));
  }

  console.log(chalk.gray('\nRun without --dry-run to apply these fixes'));
}

function displayValidationResults(result) {
  const { file, score, feedback, recommendations } = result;

  console.log(chalk.bold('\n📊 Quality Score:\n'));
  console.log(`  Overall: ${getScoreColor(score.overall)}${score.overall}/100${chalk.reset()}`);

  if (score.breakdown) {
    Object.entries(score.breakdown).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      console.log(`  ${label}: ${value}/10`);
    });
  }

  if (score.rationale) {
    console.log(chalk.gray(`\n  ${score.rationale}`));
  }

  if (feedback && feedback.length > 0) {
    console.log(chalk.bold('\nFeedback:\n'));
    feedback.slice(0, 5).forEach(item => {
      const icon = getSeverityIcon(item.type);
      console.log(`  ${icon} ${item.message}`);
    });

    if (feedback.length > 5) {
      console.log(chalk.gray(`     ... and ${feedback.length - 5} more items`));
    }
  }

  if (recommendations && recommendations.length > 0) {
    console.log(chalk.bold('\nRecommendations:\n'));
    recommendations.forEach(rec => {
      console.log(`  ${chalk.blue('•')} ${rec}`);
    });
  }

  // Status message
  if (score.overall >= 90) {
    console.log(chalk.green('\n✓ Excellent - Meets KM standards'));
  } else if (score.overall >= 75) {
    console.log(chalk.yellow('\n⚠ Good - Minor improvements suggested'));
  } else if (score.overall >= 60) {
    console.log(chalk.yellow('\n⚠ Fair - Review recommendations'));
  } else {
    console.log(chalk.red('\n✗ Needs improvement - Significant issues found'));
  }
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'error': return chalk.red('✗');
    case 'warning': return chalk.yellow('⚠');
    case 'info': return chalk.blue('ℹ');
    default: return chalk.gray('·');
  }
}

function getScoreColor(score) {
  if (score >= 90) return chalk.green;
  if (score >= 75) return chalk.yellow;
  if (score >= 60) return chalk.yellow;
  return chalk.red;
}

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
