/**
 * Content Rules - Based on KM Feedback Patterns
 *
 * These rules focus on content quality, clarity, and completeness
 * based on improvements identified in KM feedback patterns.
 */

const { visit } = require('unist-util-visit');

class ContentRules {
  constructor() {
    this.ruleSet = [
      this.checkContentClarity,
      this.checkCompleteness,
      this.checkConsistency,
      this.checkWritingStyle,
      this.checkExamples
    ];
  }

  /**
   * Check all content rules against the document
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
   * Check for content clarity improvements based on KM patterns
   */
  checkContentClarity(context) {
    const issues = [];
    const { content, patterns } = context;

    if (!patterns) return issues;

    const lines = content.split('\n');

    // Check for clarity improvements from KM patterns
    if (patterns.content) {
      patterns.content.forEach(pattern => {
        if (pattern.before && pattern.after) {
          const beforeText = pattern.before.toLowerCase();
          const afterText = pattern.after.toLowerCase();

          lines.forEach((line, index) => {
            const lowerLine = line.toLowerCase();

            // Check for vague language that was improved
            if (lowerLine.includes(beforeText)) {
              issues.push({
                id: `clarity-improvement-${index + 1}`,
                category: 'content',
                severity: 'info',
                message: 'Content could be clearer based on KM feedback patterns',
                line: index + 1,
                suggestion: `Consider: "${pattern.after}"`,
                fixable: true,
                safeFix: false,
                fix: {
                  type: 'replace',
                  from: pattern.before,
                  to: pattern.after
                }
              });
            }
          });
        }
      });
    }

    // Check for common clarity issues
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase().trim();

      // Vague language
      const vaguePatterns = [
        { pattern: 'it is recommended', suggestion: 'Use specific recommendation' },
        { pattern: 'you can', suggestion: 'Be more specific about actions' },
        { pattern: 'some users', suggestion: 'Specify which users or scenarios' },
        { pattern: 'in some cases', suggestion: 'Specify the cases' },
        { pattern: 'might work', suggestion: 'Be definitive about outcomes' }
      ];

      vaguePatterns.forEach(vague => {
        if (lowerLine.includes(vague.pattern)) {
          issues.push({
            id: `vague-language-${index + 1}`,
            category: 'content',
            severity: 'info',
            message: `Vague language: "${vague.pattern}"`,
            line: index + 1,
            suggestion: vague.suggestion,
            fixable: false,
            safeFix: false
          });
        }
      });

      // Passive voice checks
      if (this.isPassiveVoice(line)) {
        issues.push({
          id: `passive-voice-${index + 1}`,
          category: 'content',
          severity: 'info',
          message: 'Consider using active voice for clearer instructions',
          line: index + 1,
          suggestion: 'Rewrite in active voice',
          fixable: false,
          safeFix: false
        });
      }
    });

    return issues;
  }

  /**
   * Check content completeness based on context
   */
  checkCompleteness(context) {
    const issues = [];
    const { content, file } = context;

    // Check for placeholder text
    const placeholderPatterns = [
      '[TODO]',
      '[TBD]',
      '[Add content here]',
      '[Description]',
      '[Insert]',
      'Lorem ipsum'
    ];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      placeholderPatterns.forEach(placeholder => {
        if (line.includes(placeholder)) {
          issues.push({
            id: `placeholder-${index + 1}`,
            category: 'content',
            severity: 'error',
            message: `Placeholder text found: "${placeholder}"`,
            line: index + 1,
            suggestion: 'Replace with actual content',
            fixable: false,
            safeFix: false
          });
        }
      });
    });

    // Check for incomplete lists
    const unfinishedSentences = [
      'such as:',
      'including:',
      'for example:',
      'like:'
    ];

    lines.forEach((line, index) => {
      unfinishedSentences.forEach(pattern => {
        if (line.toLowerCase().endsWith(pattern)) {
          const nextLine = lines[index + 1];
          if (!nextLine || (!nextLine.trim().startsWith('-') && !nextLine.trim().startsWith('*'))) {
            issues.push({
              id: `incomplete-list-${index + 1}`,
              category: 'content',
              severity: 'warning',
              message: `Incomplete list or examples after "${pattern}"`,
              line: index + 1,
              suggestion: 'Add list items or examples',
              fixable: false,
              safeFix: false
            });
          }
        }
      });
    });

    // Check for broken internal references
    const internalLinks = content.match(/\[.*?\]\(#.*?\)/g) || [];
    const headings = this.extractAnchorTargets(content);

    internalLinks.forEach(link => {
      const match = link.match(/\[.*?\]\(#(.*?)\)/);
      if (match) {
        const anchor = match[1];
        if (!headings.includes(anchor)) {
          issues.push({
            id: `broken-internal-link-${anchor}`,
            category: 'content',
            severity: 'error',
            message: `Broken internal link: #${anchor}`,
            suggestion: 'Fix the anchor link or add the missing heading',
            fixable: false,
            safeFix: false
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check for terminology and style consistency
   */
  checkConsistency(context) {
    const issues = [];
    const { content } = context;

    // Common terminology inconsistencies based on KM patterns
    const terminologyChecks = [
      {
        variations: ['onpremise', 'on premise', 'on-premise'],
        preferred: 'on-premise',
        message: 'Inconsistent terminology for on-premise'
      },
      {
        variations: ['BTP', 'Business Technology Platform', 'SAP BTP'],
        preferred: 'SAP BTP',
        message: 'Use consistent SAP BTP terminology'
      },
      {
        variations: ['Cloud Connector', 'cloud connector', 'SCC'],
        preferred: 'Cloud Connector',
        message: 'Use consistent Cloud Connector terminology'
      }
    ];

    terminologyChecks.forEach(check => {
      const foundVariations = new Set();
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        check.variations.forEach(variation => {
          if (line.includes(variation)) {
            foundVariations.add(variation);
          }
        });
      });

      if (foundVariations.size > 1) {
        const variations = Array.from(foundVariations);
        issues.push({
          id: `terminology-inconsistency-${check.preferred.replace(/\s/g, '-')}`,
          category: 'content',
          severity: 'warning',
          message: check.message,
          suggestion: `Use "${check.preferred}" consistently throughout the document`,
          fixable: true,
          safeFix: false,
          fix: {
            type: 'standardize-terminology',
            variations: variations,
            preferred: check.preferred
          }
        });
      }
    });

    return issues;
  }

  /**
   * Check writing style based on KM improvements
   */
  checkWritingStyle(context) {
    const issues = [];
    const { content } = context;

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Check for improved phrasing from KM patterns
      const styleImprovements = [
        {
          pattern: 'for more information around',
          improvement: 'for more information about',
          message: 'Use "about" instead of "around"'
        },
        {
          pattern: 'refer to this',
          improvement: 'see this',
          message: 'Use "see" instead of "refer to" for more natural language'
        },
        {
          pattern: 'for these purposes',
          improvement: 'for this purpose',
          message: 'Use singular form for clarity'
        }
      ];

      styleImprovements.forEach(style => {
        if (lowerLine.includes(style.pattern)) {
          issues.push({
            id: `style-improvement-${index + 1}`,
            category: 'content',
            severity: 'info',
            message: style.message,
            line: index + 1,
            suggestion: `Use: "${style.improvement}"`,
            fixable: true,
            safeFix: true,
            fix: {
              type: 'replace',
              from: style.pattern,
              to: style.improvement
            }
          });
        }
      });

      // Check for proper sentence structure
      if (line.trim().length > 0 && !line.trim().startsWith('#') && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
        // Very long sentences (over 150 characters) might be hard to read
        if (line.length > 150 && line.includes(',') && !line.includes('```')) {
          issues.push({
            id: `long-sentence-${index + 1}`,
            category: 'content',
            severity: 'info',
            message: 'Long sentence might be hard to read',
            line: index + 1,
            suggestion: 'Consider breaking into shorter sentences',
            fixable: false,
            safeFix: false
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check for appropriate examples and code snippets
   */
  checkExamples(context) {
    const issues = [];
    const { content, ast } = context;

    // Check that code blocks have explanations
    visit(ast, 'code', (node) => {
      const line = this.getLineNumber(node);
      const code = node.value;

      if (code.length > 50) { // Substantial code blocks
        // Look for explanation before or after the code block
        const hasExplanation = this.hasNearbyExplanation(node, context.content);

        if (!hasExplanation) {
          issues.push({
            id: `code-needs-explanation-${line}`,
            category: 'content',
            severity: 'info',
            message: 'Code block should have explanation',
            line: line,
            suggestion: 'Add explanation before or after the code block',
            fixable: false,
            safeFix: false
          });
        }
      }
    });

    // Check for outdated year references
    const currentYear = new Date().getFullYear();
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const yearMatch = line.match(/20\d{2}/g);
      if (yearMatch) {
        yearMatch.forEach(year => {
          const yearNum = parseInt(year);
          if (yearNum < currentYear - 1 && !line.includes('©') && !line.includes('since')) {
            issues.push({
              id: `outdated-year-${index + 1}`,
              category: 'content',
              severity: 'info',
              message: `Potentially outdated year reference: ${year}`,
              line: index + 1,
              suggestion: `Consider updating to ${currentYear}`,
              fixable: true,
              safeFix: false,
              fix: {
                type: 'replace',
                from: year,
                to: currentYear.toString()
              }
            });
          }
        });
      }
    });

    return issues;
  }

  // Utility methods

  isPassiveVoice(sentence) {
    // Simple passive voice detection
    const passiveIndicators = [
      'is being', 'are being', 'was being', 'were being',
      'is done', 'are done', 'was done', 'were done',
      'is created', 'are created', 'was created', 'were created'
    ];

    const lowerSentence = sentence.toLowerCase();
    return passiveIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  extractAnchorTargets(content) {
    // Extract heading anchors from markdown
    const headings = content.match(/^#+\s+(.+)$/gm) || [];
    return headings.map(heading => {
      const text = heading.replace(/^#+\s+/, '');
      return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    });
  }

  hasNearbyExplanation(codeNode, content) {
    // Simplified check - would need more sophisticated logic
    const line = this.getLineNumber(codeNode);
    if (!line) return false;

    const lines = content.split('\n');
    const beforeLine = lines[line - 2] || '';
    const afterLine = lines[line + 1] || '';

    // Check if there's explanatory text nearby
    return (
      beforeLine.length > 20 ||
      afterLine.length > 20 ||
      beforeLine.includes(':') ||
      afterLine.includes('This') ||
      afterLine.includes('The above')
    );
  }

  getLineNumber(node) {
    return node.position ? node.position.start.line : null;
  }
}

module.exports = ContentRules;