/**
 * KM Documentation Linter - Core Linter Class
 *
 * This class implements the main linting logic, applying rules derived from
 * KM feedback patterns to improve documentation quality.
 */

import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

import StructuralRules from './rules/structural.js';
import FormattingRules from './rules/formatting.js';
import ContentRules from './rules/content.js';
import TechnicalRules from './rules/technical.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      const trainingDataPath = path.resolve(__dirname, '../training-data');

      if (existsSync(path.join(trainingDataPath, 'km-feedback-patterns.json'))) {
        const patterns = JSON.parse(readFileSync(
          path.join(trainingDataPath, 'km-feedback-patterns.json'),
          'utf8'
        ));
        this.patterns = patterns;
      }

      if (existsSync(path.join(trainingDataPath, 'correction-dictionary.json'))) {
        const corrections = JSON.parse(readFileSync(
          path.join(trainingDataPath, 'correction-dictionary.json'),
          'utf8'
        ));
        this.corrections = corrections;
      }

      if (existsSync(path.join(trainingDataPath, 'quality-examples.json'))) {
        const examples = JSON.parse(readFileSync(
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
    const content = readFileSync(filePath, 'utf8');
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
        const { appliedIssueIds } = await this.applyFixes(filePath, fixes);
        issues.forEach(issue => {
          if (appliedIssueIds.includes(issue.id)) {
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

    let appliedCount = 0;
    if (fixes.length > 0) {
      const result = await this.applyFixes(filePath, fixes, { backup: options.backup });
      appliedCount = result.appliedCount;
    }

    return {
      file: filePath,
      changes: fixes,
      applied: appliedCount > 0
    };
  }

  /**
   * Validate a file against KM standards
   */
  async validateFile(filePath, options = {}) {
    const checkResult = await this.checkFile(filePath, { comprehensive: true });
    const overall = this.calculateQualityScore(checkResult.issues, filePath);

    return {
      file: filePath,
      // Expose the score as an object so consumers can read `score.overall`
      // (and optional breakdown/rationale) consistently.
      score: { overall: overall },
      feedback: this.generateValidationFeedback(checkResult.issues),
      recommendations: this.generateRecommendations(overall, checkResult.issues)
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
        type: issue.category,
        description: issue.message,
        line: issue.line,
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
        type: issue.category,
        description: issue.message,
        line: issue.line,
        fix: issue.fix
      }));
  }

  /**
   * Apply fixes to a file.
   *
   * Replace fixes are anchored to the line reported by the issue so an
   * unanchored whole-document replace can never rewrite unrelated prose,
   * code fences, URLs, etc. The rewritten document is re-parsed before it is
   * written, and the write itself is atomic (temp file + rename) so a failure
   * leaves the original file intact.
   *
   * @returns {{appliedCount: number, appliedIssueIds: string[]}}
   */
  async applyFixes(filePath, fixes, options = {}) {
    const originalContent = readFileSync(filePath, 'utf8');
    const lines = originalContent.split('\n');
    const appliedIssueIds = [];

    // Apply fixes in reverse line order so line-index splices stay valid.
    const ordered = [...fixes].sort(
      (a, b) => (b.line || b.fix?.line || 0) - (a.line || a.fix?.line || 0)
    );

    for (const entry of ordered) {
      const spec = entry.fix;
      if (!spec) continue;

      if (spec.type === 'replace') {
        const targetLine = entry.line || spec.line;
        if (!targetLine || targetLine < 1 || targetLine > lines.length) continue;
        const idx = targetLine - 1;
        if (spec.from === undefined || !lines[idx].includes(spec.from)) continue;
        const updated = lines[idx].split(spec.from).join(spec.to);
        if (updated !== lines[idx]) {
          lines[idx] = updated;
          appliedIssueIds.push(entry.issueId);
        }
      } else if (spec.type === 'insertAfter') {
        if (typeof spec.line !== 'number') continue;
        lines.splice(spec.line, 0, spec.content);
        appliedIssueIds.push(entry.issueId);
      } else if (spec.type === 'removeLine') {
        if (typeof spec.line !== 'number') continue;
        lines.splice(spec.line - 1, 1);
        appliedIssueIds.push(entry.issueId);
      }
      // Unhandled fix types (standardize-terminology, standardize-list-markers,
      // generate-toc, ...) are intentionally not applied and not reported.
    }

    if (appliedIssueIds.length === 0) {
      return { appliedCount: 0, appliedIssueIds };
    }

    const newContent = lines.join('\n');

    // Validate the result before touching the original file.
    try {
      this.processor.parse(newContent);
    } catch (error) {
      throw new Error(`Fix validation failed, file left unchanged: ${error.message}`);
    }

    if (options.backup) {
      writeFileSync(`${filePath}.bak`, originalContent);
    }

    // Atomic write: write to a temp file then rename over the original.
    const tmpPath = `${filePath}.${process.pid}.tmp`;
    try {
      writeFileSync(tmpPath, newContent);
      renameSync(tmpPath, filePath);
    } catch (error) {
      try {
        if (existsSync(tmpPath)) unlinkSync(tmpPath);
      } catch { /* best effort cleanup */ }
      // Restore the original content if it was somehow affected.
      writeFileSync(filePath, originalContent);
      throw error;
    }

    return { appliedCount: appliedIssueIds.length, appliedIssueIds };
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

export default DocsLinter;