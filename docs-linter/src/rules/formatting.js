/**
 * Formatting Rules - Based on KM Feedback Patterns
 *
 * These rules implement formatting improvements extracted from KM team feedback,
 * focusing on consistency in headings, lists, links, and code blocks.
 */

const { visit } = require('unist-util-visit');

class FormattingRules {
  constructor() {
    this.ruleSet = [
      this.checkHeadingCapitalization,
      this.checkListFormatting,
      this.checkLinkFormatting,
      this.checkCodeBlockFormatting,
      this.checkPunctuationConsistency,
      this.checkSpacingConsistency
    ];
  }

  /**
   * Check all formatting rules against the document
   */
  async check(context) {
    const issues = [];

    for (const rule of this.ruleSet) {
      const ruleIssues = await rule.call(this, context);
      issues.push(...ruleIssues);
    }

    return issues;
  }

  /**
   * Check heading capitalization based on KM patterns
   */
  checkHeadingCapitalization(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'heading', (node) => {
      if (node.children && node.children[0] && node.children[0].type === 'text') {
        const text = node.children[0].value;
        const line = this.getLineNumber(node);

        // Check for common KM corrections in headings
        const corrections = this.getHeadingCorrections(text);
        corrections.forEach(correction => {
          issues.push({
            id: `heading-${line}-${correction.type}`,
            category: 'formatting',
            severity: 'warning',
            message: correction.message,
            line: line,
            suggestion: correction.suggestion,
            fixable: true,
            safeFix: true,
            fix: {
              type: 'replace',
              from: text,
              to: correction.corrected
            }
          });
        });

        // Check for proper title case in main headings (h1, h2)
        if (node.depth <= 2) {
          const titleCase = this.toTitleCase(text);
          if (text !== titleCase && this.shouldUseTitleCase(text)) {
            issues.push({
              id: `heading-title-case-${line}`,
              category: 'formatting',
              severity: 'info',
              message: `Consider using title case for heading: "${text}"`,
              line: line,
              suggestion: `Use: "${titleCase}"`,
              fixable: true,
              safeFix: false,
              fix: {
                type: 'replace',
                from: text,
                to: titleCase
              }
            });
          }
        }
      }
    });

    return issues;
  }

  /**
   * Check list formatting consistency
   */
  checkListFormatting(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'list', (node) => {
      const line = this.getLineNumber(node);

      // Check for consistent bullet style
      if (!node.ordered) {
        // Unordered list - check for dash vs asterisk consistency
        let hasDash = false;
        let hasAsterisk = false;

        visit(node, 'listItem', (item) => {
          // This would need to check the raw markdown, simplified here
          const marker = this.getListMarker(item, context.content);
          if (marker === '-') hasDash = true;
          if (marker === '*') hasAsterisk = true;
        });

        if (hasDash && hasAsterisk) {
          issues.push({
            id: `list-marker-consistency-${line}`,
            category: 'formatting',
            severity: 'warning',
            message: 'Mixed bullet markers in list (use consistent - or * throughout)',
            line: line,
            suggestion: 'Use consistent bullet markers (prefer dashes "-")',
            fixable: true,
            safeFix: true,
            fix: {
              type: 'standardize-list-markers'
            }
          });
        }
      }

      // Check for proper spacing in list items
      node.children.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          const firstChild = item.children[0];
          if (firstChild.type === 'paragraph' && firstChild.children[0]) {
            const text = firstChild.children[0].value;
            if (text && !text.startsWith(' ')) {
              // This is handled by markdown parser, but check for double spaces
              if (text.includes('  ')) {
                issues.push({
                  id: `list-spacing-${line}-${index}`,
                  category: 'formatting',
                  severity: 'info',
                  message: 'Multiple spaces in list item',
                  line: this.getLineNumber(item),
                  fixable: true,
                  safeFix: true,
                  fix: {
                    type: 'replace',
                    from: text,
                    to: text.replace(/ {2,}/g, ' ')
                  }
                });
              }
            }
          }
        }
      });
    });

    return issues;
  }

  /**
   * Check link formatting consistency
   */
  checkLinkFormatting(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'link', (node) => {
      const line = this.getLineNumber(node);
      const url = node.url;
      const title = node.children[0]?.value || '';

      // Check for common link formatting issues from KM patterns
      if (url && title) {
        // Check for "refer to this" vs "see this" patterns
        const parentText = this.getParentText(node, context.ast);
        if (parentText) {
          const linkContext = parentText.toLowerCase();

          if (linkContext.includes('refer to this') || linkContext.includes('refer to')) {
            issues.push({
              id: `link-context-${line}`,
              category: 'formatting',
              severity: 'info',
              message: 'Consider using "see" instead of "refer to" for links',
              line: line,
              suggestion: 'Use "see" for more natural link text',
              fixable: false,
              safeFix: false
            });
          }

          if (linkContext.includes('for more information around')) {
            issues.push({
              id: `link-preposition-${line}`,
              category: 'formatting',
              severity: 'warning',
              message: 'Use "about" instead of "around" in link context',
              line: line,
              suggestion: 'Use "For more information about" instead of "around"',
              fixable: true,
              safeFix: true,
              fix: {
                type: 'replace',
                from: 'For more information around',
                to: 'For more information about'
              }
            });
          }
        }

        // Check for bare URLs that should be formatted as links
        if (title === url && url.length > 50) {
          issues.push({
            id: `link-title-${line}`,
            category: 'formatting',
            severity: 'info',
            message: 'Consider using descriptive text instead of bare URL',
            line: line,
            suggestion: 'Use descriptive link text instead of the full URL',
            fixable: false,
            safeFix: false
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check code block formatting
   */
  checkCodeBlockFormatting(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'code', (node) => {
      const line = this.getLineNumber(node);
      const code = node.value;

      // Check for proper language specification
      if (!node.lang && code.length > 20) {
        issues.push({
          id: `code-lang-${line}`,
          category: 'formatting',
          severity: 'info',
          message: 'Consider specifying language for code block',
          line: line,
          suggestion: 'Add language identifier (e.g., ```bash, ```javascript)',
          fixable: false,
          safeFix: false
        });
      }

      // Check for common formatting issues in code blocks
      if (code.includes('````')) {
        issues.push({
          id: `code-fence-${line}`,
          category: 'formatting',
          severity: 'warning',
          message: 'Incorrect code fence formatting (four backticks)',
          line: line,
          suggestion: 'Use three backticks (```) for code fences',
          fixable: true,
          safeFix: true,
          fix: {
            type: 'replace',
            from: '````',
            to: '```'
          }
        });
      }
    });

    return issues;
  }

  /**
   * Check punctuation consistency based on KM patterns
   */
  checkPunctuationConsistency(context) {
    const issues = [];
    const { content, corrections } = context;

    if (corrections && corrections.typos) {
      const lines = content.split('\n');

      Object.entries(corrections.typos).forEach(([wrong, correct]) => {
        lines.forEach((line, index) => {
          if (line.includes(wrong)) {
            issues.push({
              id: `punctuation-${index + 1}-${wrong}`,
              category: 'formatting',
              severity: 'warning',
              message: `Punctuation issue: "${wrong}" should be "${correct}"`,
              line: index + 1,
              suggestion: `Replace "${wrong}" with "${correct}"`,
              fixable: true,
              safeFix: true,
              fix: {
                type: 'replace',
                from: wrong,
                to: correct
              }
            });
          }
        });
      });
    }

    return issues;
  }

  /**
   * Check spacing consistency
   */
  checkSpacingConsistency(context) {
    const issues = [];
    const { content } = context;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for multiple spaces (except in code blocks)
      if (!line.trim().startsWith('```') && !line.trim().startsWith('    ')) {
        if (line.match(/ {3,}/)) {
          issues.push({
            id: `spacing-multiple-${index + 1}`,
            category: 'formatting',
            severity: 'info',
            message: 'Multiple consecutive spaces found',
            line: index + 1,
            suggestion: 'Use single spaces between words',
            fixable: true,
            safeFix: true,
            fix: {
              type: 'replace',
              from: line,
              to: line.replace(/ {2,}/g, ' ')
            }
          });
        }
      }

      // Check for trailing spaces
      if (line.endsWith(' ') && line.trim().length > 0) {
        issues.push({
          id: `spacing-trailing-${index + 1}`,
          category: 'formatting',
          severity: 'info',
          message: 'Trailing spaces found',
          line: index + 1,
          fixable: true,
          safeFix: true,
          fix: {
            type: 'replace',
            from: line,
            to: line.trimEnd()
          }
        });
      }
    });

    return issues;
  }

  // Utility methods

  getLineNumber(node) {
    return node.position ? node.position.start.line : null;
  }

  getListMarker(item, content) {
    // Simplified - would need more complex logic to extract actual marker
    const line = this.getLineNumber(item);
    if (line && content) {
      const lines = content.split('\n');
      const lineContent = lines[line - 1];
      if (lineContent && lineContent.trim().startsWith('- ')) return '-';
      if (lineContent && lineContent.trim().startsWith('* ')) return '*';
    }
    return '-'; // default
  }

  getParentText(node, ast) {
    // Simplified - would need to traverse up to find parent paragraph
    return '';
  }

  getHeadingCorrections(text) {
    const corrections = [];

    // Based on extracted KM patterns
    const patterns = {
      'Support ticket checklist': {
        corrected: 'Checklist for Support Tickets',
        type: 'title-improvement',
        message: 'Heading should be more descriptive',
        suggestion: 'Use "Checklist for Support Tickets"'
      },
      'Common causes for deployment errors': {
        corrected: 'Common Causes for Deployment Errors',
        type: 'capitalization',
        message: 'Heading should use title case',
        suggestion: 'Capitalize important words in headings'
      }
    };

    if (patterns[text]) {
      corrections.push(patterns[text]);
    }

    return corrections;
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
      // Don't capitalize small words unless they're at the beginning
      const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'up'];
      const word = txt.toLowerCase();

      if (smallWords.includes(word)) {
        return word;
      }

      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  shouldUseTitleCase(text) {
    // Only suggest title case for clearly title-like headings
    const titleIndicators = ['overview', 'introduction', 'getting started', 'prerequisites', 'conclusion'];
    const lowerText = text.toLowerCase();
    return titleIndicators.some(indicator => lowerText.includes(indicator));
  }
}

module.exports = FormattingRules;