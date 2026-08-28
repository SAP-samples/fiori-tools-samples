/**
 * Content Rules - Based on KM Feedback Patterns
 *
 * These rules focus on content quality, clarity, and completeness
 * based on improvements identified in KM feedback patterns.
 */

import { visit } from 'unist-util-visit';

class ContentRules {
  constructor() {
    this.ruleSet = [
      this.checkContentClarity,
      this.checkCompleteness,
      this.checkConsistency,
      this.checkWritingStyle,
      this.checkExamples,
      this.checkSemicolonUsage,
      this.checkSingleItemOrderedLists,
      this.checkListCountInProse
    ];
  }

  async check(context) {
    const issues = [];
    for (const rule of this.ruleSet) {
      const ruleIssues = await rule.call(this, context);
      issues.push(...ruleIssues);
    }
    return issues;
  }

  checkContentClarity(context) {
    const issues = [];
    const { content, patterns } = context;

    if (!patterns) return issues;

    const lines = content.split('\n');

    if (patterns.content) {
      patterns.content.forEach(pattern => {
        if (pattern.before && pattern.after) {
          const beforeText = pattern.before.toLowerCase();
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(beforeText)) {
              issues.push({
                id: `clarity-improvement-${index + 1}`,
                category: 'content',
                severity: 'info',
                message: 'Content could be clearer based on KM feedback patterns',
                line: index + 1,
                suggestion: `Consider: "${pattern.after}"`,
                fixable: true,
                safeFix: false,
                fix: { type: 'replace', from: pattern.before, to: pattern.after }
              });
            }
          });
        }
      });
    }

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase().trim();

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

  checkCompleteness(context) {
    const issues = [];
    const { content } = context;

    const placeholderPatterns = ['[TODO]', '[TBD]', '[Add content here]', '[Description]', '[Insert]', 'Lorem ipsum'];
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

    const unfinishedSentences = ['such as:', 'including:', 'for example:', 'like:'];
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

  checkConsistency(context) {
    const issues = [];
    const { content } = context;

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
      content.split('\n').forEach(line => {
        check.variations.forEach(variation => {
          if (line.includes(variation)) foundVariations.add(variation);
        });
      });

      if (foundVariations.size > 1) {
        issues.push({
          id: `terminology-inconsistency-${check.preferred.replace(/\s/g, '-')}`,
          category: 'content',
          severity: 'warning',
          message: check.message,
          suggestion: `Use "${check.preferred}" consistently throughout the document`,
          fixable: true,
          safeFix: false,
          fix: { type: 'standardize-terminology', variations: Array.from(foundVariations), preferred: check.preferred }
        });
      }
    });

    return issues;
  }

  checkWritingStyle(context) {
    const issues = [];
    const { content } = context;

    const styleImprovements = [
      { pattern: 'for more information around', improvement: 'for more information about', message: 'Use "about" instead of "around"' },
      { pattern: 'refer to this', improvement: 'see this', message: 'Use "see" instead of "refer to" for more natural language' },
      { pattern: 'for these purposes', improvement: 'for this purpose', message: 'Use singular form for clarity' }
    ];

    content.split('\n').forEach((line, index) => {
      const lowerLine = line.toLowerCase();

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
            fix: { type: 'replace', from: style.pattern, to: style.improvement }
          });
        }
      });

      if (line.trim().length > 0 && !line.trim().startsWith('#') && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
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

  checkExamples(context) {
    const issues = [];
    const { content, ast } = context;

    visit(ast, 'code', (node) => {
      const line = this.getLineNumber(node);
      if (node.value.length > 50 && !this.hasNearbyExplanation(node, content)) {
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
    });

    const currentYear = new Date().getFullYear();
    content.split('\n').forEach((line, index) => {
      const yearMatch = line.match(/20\d{2}/g);
      if (yearMatch) {
        yearMatch.forEach(year => {
          if (parseInt(year) < currentYear - 1 && !line.includes('©') && !line.includes('since')) {
            issues.push({
              id: `outdated-year-${index + 1}`,
              category: 'content',
              severity: 'info',
              message: `Potentially outdated year reference: ${year}`,
              line: index + 1,
              suggestion: `Consider updating to ${currentYear}`,
              fixable: true,
              safeFix: false,
              fix: { type: 'replace', from: year, to: currentYear.toString() }
            });
          }
        });
      }
    });

    return issues;
  }

  checkSemicolonUsage(context) {
    const issues = [];
    const { content } = context;
    let inCodeBlock = false;

    content.split('\n').forEach((line, index) => {
      if (line.trim().startsWith('```')) { inCodeBlock = !inCodeBlock; return; }
      if (inCodeBlock || line.trim().startsWith('#')) return;

      const stripped = line.replace(/`[^`]*`/g, '');
      if (stripped.includes(';')) {
        issues.push({
          id: `semicolon-in-prose-${index + 1}`,
          category: 'content',
          severity: 'warning',
          message: 'Semicolon in prose — replace with colon or period',
          line: index + 1,
          suggestion: 'Use a colon when the second clause expands the first; use a period for independent clauses',
          fixable: false,
          safeFix: false
        });
      }
    });

    return issues;
  }

  checkSingleItemOrderedLists(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'list', (node) => {
      if (node.ordered && node.children.length === 1) {
        issues.push({
          id: `single-item-ordered-list-${this.getLineNumber(node)}`,
          category: 'content',
          severity: 'warning',
          message: 'Ordered list with only one item — convert to a bullet or prose sentence',
          line: this.getLineNumber(node),
          suggestion: 'Use an unordered list item (-) or a prose sentence instead',
          fixable: false,
          safeFix: false
        });
      }
    });

    return issues;
  }

  checkListCountInProse(context) {
    const issues = [];
    const { content } = context;

    content.split('\n').forEach((line, index) => {
      if (line.match(/\b(there are|the following)\s+\d+\b/i)) {
        issues.push({
          id: `list-count-in-prose-${index + 1}`,
          category: 'content',
          severity: 'info',
          message: 'Do not state the number of list items in prose — use "the following" without a count',
          line: index + 1,
          suggestion: 'Remove the number and use "the following" instead',
          fixable: false,
          safeFix: false
        });
      }
    });

    return issues;
  }

  // Utility methods

  isPassiveVoice(sentence) {
    const passiveIndicators = [
      'is being', 'are being', 'was being', 'were being',
      'is done', 'are done', 'was done', 'were done',
      'is created', 'are created', 'was created', 'were created'
    ];
    return passiveIndicators.some(indicator => sentence.toLowerCase().includes(indicator));
  }

  extractAnchorTargets(content) {
    const headings = content.match(/^#+\s+(.+)$/gm) || [];
    return headings.map(heading =>
      heading.replace(/^#+\s+/, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    );
  }

  hasNearbyExplanation(codeNode, content) {
    const line = this.getLineNumber(codeNode);
    if (!line) return false;
    const lines = content.split('\n');
    const beforeLine = lines[line - 2] || '';
    const afterLine = lines[line + 1] || '';
    return beforeLine.length > 20 || afterLine.length > 20 || beforeLine.includes(':') || afterLine.includes('This') || afterLine.includes('The above');
  }

  getLineNumber(node) {
    return node.position ? node.position.start.line : null;
  }
}

export default ContentRules;
