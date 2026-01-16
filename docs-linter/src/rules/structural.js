/**
 * Structural Rules - Based on KM Feedback Patterns
 *
 * These rules ensure consistent document structure, proper heading hierarchy,
 * and required sections based on quality examples.
 */

const { visit } = require('unist-util-visit');

class StructuralRules {
  constructor() {
    this.ruleSet = [
      this.checkRequiredSections,
      this.checkHeadingHierarchy,
      this.checkTableOfContents,
      this.checkSectionOrder,
      this.checkDocumentLength
    ];
  }

  /**
   * Check all structural rules against the document
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
   * Check for required sections based on quality examples
   */
  checkRequiredSections(context) {
    const issues = [];
    const { ast, file } = context;

    const headings = this.extractHeadings(ast);
    const headingTexts = headings.map(h => h.text.toLowerCase());

    // Required sections for README files based on quality examples
    if (file.endsWith('README.md')) {
      const requiredSections = [
        { name: 'overview', alternatives: ['introduction', 'about'] },
        { name: 'prerequisites', alternatives: ['requirements'] }
      ];

      const recommendedSections = [
        { name: 'getting started', alternatives: ['usage', 'how to use'] },
        { name: 'additional resources', alternatives: ['resources', 'links', 'references'] }
      ];

      requiredSections.forEach(section => {
        const hasSection = headingTexts.some(heading =>
          heading.includes(section.name) ||
          section.alternatives.some(alt => heading.includes(alt))
        );

        if (!hasSection) {
          issues.push({
            id: `missing-required-section-${section.name}`,
            category: 'structural',
            severity: 'error',
            message: `Missing required section: ${section.name}`,
            suggestion: `Add a "${this.capitalizeFirst(section.name)}" section`,
            fixable: true,
            safeFix: false,
            fix: {
              type: 'insertAfter',
              line: 1,
              content: `\n## ${this.capitalizeFirst(section.name)}\n\n[Add ${section.name} content here]\n`
            }
          });
        }
      });

      recommendedSections.forEach(section => {
        const hasSection = headingTexts.some(heading =>
          heading.includes(section.name) ||
          section.alternatives.some(alt => heading.includes(alt))
        );

        if (!hasSection) {
          issues.push({
            id: `missing-recommended-section-${section.name}`,
            category: 'structural',
            severity: 'info',
            message: `Consider adding recommended section: ${section.name}`,
            suggestion: `Add a "${this.capitalizeFirst(section.name)}" section`,
            fixable: false,
            safeFix: false
          });
        }
      });

      // Check for troubleshooting or known issues section for technical guides
      const isTechnicalGuide = file.includes('onpremise') || file.includes('destination') ||
                                headingTexts.some(h => h.includes('configuration') || h.includes('setup'));

      if (isTechnicalGuide) {
        const hasTroubleshooting = headingTexts.some(h =>
          h.includes('troubleshooting') || h.includes('issues') || h.includes('checklist')
        );

        if (!hasTroubleshooting) {
          issues.push({
            id: 'missing-troubleshooting',
            category: 'structural',
            severity: 'warning',
            message: 'Technical guides should include troubleshooting or known issues section',
            suggestion: 'Add "Known Issues" or "Troubleshooting" section',
            fixable: false,
            safeFix: false
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check heading hierarchy (h1 -> h2 -> h3, no skipping levels)
   */
  checkHeadingHierarchy(context) {
    const issues = [];
    const { ast } = context;

    const headings = this.extractHeadings(ast);
    let previousDepth = 0;

    headings.forEach((heading, index) => {
      const { depth, line, text } = heading;

      // Check for skipped heading levels
      if (depth > previousDepth + 1) {
        issues.push({
          id: `heading-hierarchy-skip-${line}`,
          category: 'structural',
          severity: 'warning',
          message: `Heading level skipped: h${depth} after h${previousDepth}`,
          line: line,
          suggestion: `Use h${previousDepth + 1} instead of h${depth}`,
          fixable: true,
          safeFix: false,
          fix: {
            type: 'replace',
            from: '#'.repeat(depth),
            to: '#'.repeat(previousDepth + 1)
          }
        });
      }

      // Check for multiple h1 headings
      if (depth === 1 && index > 0) {
        issues.push({
          id: `multiple-h1-${line}`,
          category: 'structural',
          severity: 'error',
          message: 'Multiple h1 headings found - use only one h1 per document',
          line: line,
          suggestion: 'Change to h2 or merge with existing h1',
          fixable: true,
          safeFix: false,
          fix: {
            type: 'replace',
            from: '#',
            to: '##'
          }
        });
      }

      previousDepth = depth;
    });

    return issues;
  }

  /**
   * Check for table of contents when needed
   */
  checkTableOfContents(context) {
    const issues = [];
    const { ast, content } = context;

    const headings = this.extractHeadings(ast);
    const contentLength = content.length;

    // Long documents should have table of contents
    if (contentLength > 10000 && headings.length > 8) {
      const hasTOC = content.toLowerCase().includes('table of contents') ||
                     content.toLowerCase().includes('- [') ||
                     content.includes('](#');

      if (!hasTOC) {
        issues.push({
          id: 'missing-toc',
          category: 'structural',
          severity: 'info',
          message: 'Long document should include table of contents',
          suggestion: 'Add table of contents after the overview section',
          fixable: true,
          safeFix: false,
          fix: {
            type: 'generate-toc'
          }
        });
      }
    }

    return issues;
  }

  /**
   * Check section order based on quality examples
   */
  checkSectionOrder(context) {
    const issues = [];
    const { ast, file } = context;

    if (!file.endsWith('README.md')) return issues;

    const headings = this.extractHeadings(ast);
    const headingTexts = headings.map(h => h.text.toLowerCase());

    // Expected order based on quality examples
    const expectedOrder = [
      'overview',
      'prerequisites',
      'getting started',
      'configuration',
      'usage',
      'troubleshooting',
      'additional resources',
      'license'
    ];

    // Find sections that exist and check their order
    const foundSections = [];
    headingTexts.forEach((heading, index) => {
      expectedOrder.forEach(expectedSection => {
        if (heading.includes(expectedSection)) {
          foundSections.push({
            name: expectedSection,
            index: index,
            line: headings[index].line
          });
        }
      });
    });

    // Check if sections are in correct order
    for (let i = 1; i < foundSections.length; i++) {
      const current = foundSections[i];
      const previous = foundSections[i - 1];

      const currentExpectedIndex = expectedOrder.indexOf(current.name);
      const previousExpectedIndex = expectedOrder.indexOf(previous.name);

      if (currentExpectedIndex < previousExpectedIndex) {
        issues.push({
          id: `section-order-${current.line}`,
          category: 'structural',
          severity: 'info',
          message: `Section "${current.name}" should come before "${previous.name}"`,
          line: current.line,
          suggestion: `Reorder sections to match standard structure`,
          fixable: false,
          safeFix: false
        });
      }
    }

    return issues;
  }

  /**
   * Check document length and structure balance
   */
  checkDocumentLength(context) {
    const issues = [];
    const { content, file } = context;

    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);

    // Very short README files might be incomplete
    if (file.endsWith('README.md') && nonEmptyLines.length < 20) {
      issues.push({
        id: 'short-readme',
        category: 'structural',
        severity: 'warning',
        message: 'README appears to be very short - consider adding more content',
        suggestion: 'Add sections like Overview, Prerequisites, Usage, and Additional Resources',
        fixable: false,
        safeFix: false
      });
    }

    // Very long files without proper structure
    if (nonEmptyLines.length > 500) {
      const headings = this.extractHeadings(context.ast);
      const headingRatio = headings.length / nonEmptyLines.length;

      if (headingRatio < 0.02) { // Less than 2% headings
        issues.push({
          id: 'long-unstructured',
          category: 'structural',
          severity: 'info',
          message: 'Long document should have more headings for better structure',
          suggestion: 'Break content into sections with descriptive headings',
          fixable: false,
          safeFix: false
        });
      }
    }

    return issues;
  }

  // Utility methods

  extractHeadings(ast) {
    const headings = [];

    visit(ast, 'heading', (node) => {
      if (node.children && node.children[0] && node.children[0].type === 'text') {
        headings.push({
          depth: node.depth,
          text: node.children[0].value,
          line: node.position ? node.position.start.line : null
        });
      }
    });

    return headings;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = StructuralRules;