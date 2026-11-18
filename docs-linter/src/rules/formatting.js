/**
 * Formatting Rules - Based on KM Feedback Patterns
 *
 * These rules implement formatting improvements extracted from KM team feedback,
 * focusing on consistency in headings, lists, links, and code blocks.
 */

import { visit } from 'unist-util-visit';

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
      if (node.children && node.children.length > 0) {
        const text = this.extractHeadingText(node);
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

        // Check for proper title case — applies to all heading levels per KM style guide
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
        // Note: the "refer to this" / "for more information around" link-text
        // checks were removed here. They are covered once by content.js
        // (checkWritingStyle); keeping them here duplicated the same finding.

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
          // No safe auto-fix: the fence characters are not part of node.value,
          // so an anchored replace cannot reliably rewrite them. Detection only.
          fixable: false,
          safeFix: false
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
        // Only consider spacing OUTSIDE inline-code spans so we neither flag
        // nor collapse intentional spacing inside `code`. Detection and fix
        // use the same threshold (3+ spaces).
        const segments = line.split(/(`[^`]*`)/);
        const hasMultiple = segments.some((seg, i) => i % 2 === 0 && / {3,}/.test(seg));
        if (hasMultiple) {
          const collapsed = segments
            .map((seg, i) => (i % 2 === 0 ? seg.replace(/ {3,}/g, ' ') : seg))
            .join('');
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
              to: collapsed
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

  /**
   * Reconstruct the full text of a heading from all of its child nodes
   * (text, inline code, links, emphasis, ...). Reading only children[0].value
   * truncates headings such as "Configure `xs login`" to "Configure ".
   */
  extractHeadingText(node) {
    let text = '';
    const walk = (nodes) => {
      for (const child of nodes || []) {
        if (child.type === 'text' || child.type === 'inlineCode') {
          text += child.value;
        } else if (child.children) {
          walk(child.children);
        }
      }
    };
    walk(node.children);
    return text;
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
    // Chicago title case per KM style guide.
    // Lowercase: articles, coordinating conjunctions, and short prepositions
    // (4 letters or fewer). "with" (5 letters) is intentionally NOT a small
    // word, to stay consistent with the documented 4-letters-or-fewer rule.
    const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet']);

    const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    const isSmall = (core) => smallWords.has(core.toLowerCase());

    const formatToken = (token, isEdge) => {
      // Separate surrounding punctuation from the core word so trailing or
      // leading punctuation (e.g. "to,") does not defeat small-word matching.
      const m = token.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
      const lead = m[1];
      let core = m[2];
      const trail = m[3];

      if (core.includes('-')) {
        // Title-case each hyphen-separated part; interior small words stay lower.
        core = core
          .split('-')
          .map((part, i) => (i > 0 && isSmall(part) ? part.toLowerCase() : capitalize(part)))
          .join('-');
      } else if (!isEdge && isSmall(core)) {
        core = core.toLowerCase();
      } else {
        core = capitalize(core);
      }
      return lead + core + trail;
    };

    // Tokenize on any whitespace run (spaces, tabs, repeated spaces) so no
    // empty tokens are produced; the result is normalized to single spaces.
    const tokens = str.split(/\s+/).filter(Boolean);
    return tokens
      .map((token, index) => formatToken(token, index === 0 || index === tokens.length - 1))
      .join(' ');
  }

  shouldUseTitleCase(text) {
    // Apply title case check to all headings — not just a subset
    return text.length > 2;
  }
}

export default FormattingRules;