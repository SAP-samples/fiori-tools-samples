/**
 * KM Documentation Linter - Core Linter Class
 *
 * This class implements the main linting logic, applying rules derived from
 * KM feedback patterns to improve documentation quality.
 */

const fs = require('fs');
const path = require('path');
const { unified } = require('unified');
const remarkParse = require('remark-parse');
const { visit } = require('unist-util-visit');

const StructuralRules = require('./rules/structural');
const FormattingRules = require('./rules/formatting');
const ContentRules = require('./rules/content');
const TechnicalRules = require('./rules/technical');

class DocsLinter {
  constructor() {
    this.rules = {
      structural: new StructuralRules(),
      formatting: new FormattingRules(),
      content: new ContentRules(),
      technical: new TechnicalRules()
    };

    // Initialize remark processor for markdown parsing
    this.processor = unified().use(remarkParse);

    this.loadTrainingData();
  }

  /**
   * Load training data from extracted KM patterns
   */
  loadTrainingData() {
    try {
      const trainingDataPath = path.resolve(__dirname, '../../training-data');

      if (fs.existsSync(path.join(trainingDataPath, 'km-feedback-patterns.json'))) {
        const patterns = JSON.parse(fs.readFileSync(
          path.join(trainingDataPath, 'km-feedback-patterns.json'),
          'utf8'
        ));
        this.patterns = patterns;
      }

      if (fs.existsSync(path.join(trainingDataPath, 'correction-dictionary.json'))) {
        const corrections = JSON.parse(fs.readFileSync(
          path.join(trainingDataPath, 'correction-dictionary.json'),
          'utf8'
        ));
        this.corrections = corrections;
      }

      if (fs.existsSync(path.join(trainingDataPath, 'quality-examples.json'))) {
        const examples = JSON.parse(fs.readFileSync(
          path.join(trainingDataPath, 'quality-examples.json'),
          'utf8'
        ));
        this.qualityExamples = examples;
      }

    } catch (error) {
      console.warn('Warning: Could not load training data:', error.message);
    }
  }

  /**
   * Check a file for issues based on KM feedback patterns
   */
  async checkFile(filePath, options = {}) {
    const content = fs.readFileSync(filePath, 'utf8');
    const ast = this.processor.parse(content);

    const issues = [];
    const context = {
      file: filePath,
      content,
      ast,
      patterns: this.patterns,
      corrections: this.corrections,
      options
    };

    // Apply all rule categories
    issues.push(...await this.rules.structural.check(context));
    issues.push(...await this.rules.formatting.check(context));
    issues.push(...await this.rules.content.check(context));
    issues.push(...await this.rules.technical.check(context));

    // Auto-fix safe issues if requested
    if (options.autoFixSafe) {
      const fixes = this.getSafeFixes(issues);
      if (fixes.length > 0) {
        await this.applyFixes(filePath, fixes);
        issues.forEach(issue => {
          if (fixes.some(fix => fix.issueId === issue.id)) {
            issue.fixed = true;
          }
        });
      }
    }

    return {
      file: filePath,
      issues: issues,
      summary: this.generateSummary(issues)
    };
  }

  /**
   * Fix a file by applying corrections
   */
  async fixFile(filePath, options = {}) {
    const checkResult = await this.checkFile(filePath, options);
    const fixes = options.safeOnly ?
      this.getSafeFixes(checkResult.issues) :
      this.getAllFixes(checkResult.issues);

    if (options.dryRun) {
      return {
        file: filePath,
        changes: fixes,
        applied: false
      };
    }

    if (fixes.length > 0) {
      await this.applyFixes(filePath, fixes);
    }

    return {
      file: filePath,
      changes: fixes,
      applied: true
    };
  }

  /**
   * Validate a file against KM standards
   */
  async validateFile(filePath, options = {}) {
    const checkResult = await this.checkFile(filePath, { comprehensive: true });
    const score = this.calculateQualityScore(checkResult.issues, filePath);

    return {
      file: filePath,
      score: score,
      feedback: this.generateValidationFeedback(checkResult.issues),
      recommendations: this.generateRecommendations(score, checkResult.issues)
    };
  }

  /**
   * Get fixes that are considered safe to apply automatically
   */
  getSafeFixes(issues) {
    return issues
      .filter(issue => issue.fixable && issue.safeFix)
      .map(issue => ({
        issueId: issue.id,
        type: issue.type,
        description: issue.message,
        fix: issue.fix
      }));
  }

  /**
   * Get all available fixes
   */
  getAllFixes(issues) {
    return issues
      .filter(issue => issue.fixable)
      .map(issue => ({
        issueId: issue.id,
        type: issue.type,
        description: issue.message,
        fix: issue.fix
      }));
  }

  /**
   * Apply fixes to a file
   */
  async applyFixes(filePath, fixes) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Apply fixes in reverse order to maintain line numbers
    fixes.sort((a, b) => (b.fix.line || 0) - (a.fix.line || 0));

    for (const fix of fixes) {
      if (fix.fix.type === 'replace') {
        content = content.replace(fix.fix.from, fix.fix.to);
      } else if (fix.fix.type === 'insertAfter') {
        const lines = content.split('\n');
        lines.splice(fix.fix.line, 0, fix.fix.content);
        content = lines.join('\n');
      } else if (fix.fix.type === 'removeLine') {
        const lines = content.split('\n');
        lines.splice(fix.fix.line - 1, 1);
        content = lines.join('\n');
      }
    }

    fs.writeFileSync(filePath, content);
  }

  /**
   * Calculate quality score based on issues found
   */
  calculateQualityScore(issues, filePath) {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 2;
          break;
      }
    });

    // Bonus points for following quality examples
    if (this.qualityExamples) {
      const isQualityExample = this.qualityExamples.some(example =>
        filePath.includes(example.file.replace('./', ''))
      );
      if (isQualityExample) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate validation feedback
   */
  generateValidationFeedback(issues) {
    return issues.map(issue => ({
      type: issue.severity,
      message: issue.message,
      line: issue.line,
      suggestion: issue.suggestion
    }));
  }

  /**
   * Generate recommendations based on score and issues
   */
  generateRecommendations(score, issues) {
    const recommendations = [];

    if (score < 50) {
      recommendations.push('Consider reviewing high-quality examples in the repository');
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    if (errorCount > 0) {
      recommendations.push('Fix critical errors before submitting for review');
    }

    const formattingIssues = issues.filter(i => i.category === 'formatting').length;
    if (formattingIssues > 3) {
      recommendations.push('Review formatting standards in the KM style guide');
    }

    return recommendations;
  }

  /**
   * Generate summary of issues
   */
  generateSummary(issues) {
    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      fixable: issues.filter(i => i.fixable).length
    };

    summary.categories = {
      structural: issues.filter(i => i.category === 'structural').length,
      formatting: issues.filter(i => i.category === 'formatting').length,
      content: issues.filter(i => i.category === 'content').length,
      technical: issues.filter(i => i.category === 'technical').length
    };

    return summary;
  }

  /**
   * Extract text content from markdown AST
   */
  extractText(ast) {
    let text = '';
    visit(ast, (node) => {
      if (node.type === 'text') {
        text += node.value + ' ';
      }
    });
    return text.trim();
  }

  /**
   * Get line number for a node in the AST
   */
  getLineNumber(node) {
    return node.position ? node.position.start.line : null;
  }
}

module.exports = DocsLinter;