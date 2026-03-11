/**
 * Technical Rules - Based on KM Feedback Patterns
 *
 * These rules focus on technical accuracy, URL validation,
 * command syntax, and configuration examples.
 */

import { visit } from 'unist-util-visit';

class TechnicalRules {
  constructor() {
    this.ruleSet = [
      this.checkURLs,
      this.checkCommandSyntax,
      this.checkConfigurationExamples,
      this.checkTechnicalAccuracy,
      this.checkVersionReferences
    ];
  }

  /**
   * Check all technical rules against the document
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
   * Check URLs for validity and format
   */
  checkURLs(context) {
    const issues = [];
    const { ast, corrections } = context;

    visit(ast, 'link', (node) => {
      const line = this.getLineNumber(node);
      const url = node.url;

      if (url) {
        // Validate URL format first
        let urlObj;
        try {
          urlObj = new URL(url);
        } catch (error) {
          // Invalid URL format - will be caught by other validators
          return;
        }

        // Check for common URL corrections from KM patterns
        if (corrections && corrections.typos) {
          Object.entries(corrections.typos).forEach(([wrong, correct]) => {
            // Only match whole domain components, not substrings
            const hostname = urlObj.hostname.toLowerCase();
            if (hostname.includes(wrong.toLowerCase()) || url.includes(wrong)) {
              issues.push({
                id: `url-correction-${line}`,
                category: 'technical',
                severity: 'error',
                message: `URL contains known error: "${wrong}"`,
                line: line,
                suggestion: `Should be: "${correct}"`,
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
        }

        // Check for broken or suspicious URLs
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          issues.push({
            id: `localhost-url-${line}`,
            category: 'technical',
            severity: 'warning',
            message: 'Localhost URL in documentation',
            line: line,
            suggestion: 'Replace with example or placeholder URL',
            fixable: false,
            safeFix: false
          });
        }

        // Check for HTTP URLs that should be HTTPS
        if (url.startsWith('http://') && !url.includes('localhost')) {
          issues.push({
            id: `insecure-url-${line}`,
            category: 'technical',
            severity: 'info',
            message: 'Consider using HTTPS instead of HTTP',
            line: line,
            suggestion: 'Use HTTPS for better security',
            fixable: true,
            safeFix: false,
            fix: {
              type: 'replace',
              from: 'http://',
              to: 'https://'
            }
          });
        }

        // Check for common SAP URL patterns
        // Use proper hostname validation to prevent URL injection attacks
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.toLowerCase();

          // Validate that hostname is exactly a SAP domain
          // This prevents evil.com/community.sap.com or community.sap.com.evil.com
          const isSAPDomain = hostname === 'sap.com' ||
                             hostname.endsWith('.sap.com');

          // Check for valid SAP subdomain patterns (help.sap.com, community.sap.com, etc.)
          const sapSubdomainPattern = /^[a-z0-9]+\.sap\.com$/;
          const isSAPSubdomain = sapSubdomainPattern.test(hostname);

          if (isSAPDomain && (isSAPSubdomain || hostname === 'sap.com')) {
            if (url.includes(' ') || url.includes('\n')) {
              issues.push({
                id: `malformed-sap-url-${line}`,
                category: 'technical',
                severity: 'error',
                message: 'Malformed SAP URL with spaces',
                line: line,
                suggestion: 'Remove spaces from URL',
                fixable: true,
                safeFix: true,
                fix: {
                  type: 'replace',
                  from: url,
                  to: url.replace(/\s+/g, '')
                }
              });
            }
          }
        } catch (error) {
          // Invalid URL format - will be caught by other validators
        }
      }
    });

    return issues;
  }

  /**
   * Check command syntax in code blocks
   */
  checkCommandSyntax(context) {
    const issues = [];
    const { ast } = context;

    visit(ast, 'code', (node) => {
      const line = this.getLineNumber(node);
      const code = node.value;
      const lang = node.lang;

      // Check bash/shell commands
      if (lang === 'bash' || lang === 'sh' || lang === 'shell' || !lang) {
        const commands = code.split('\n').filter(line => line.trim());

        commands.forEach((command, index) => {
          const trimmedCmd = command.trim();

          // Check for common command issues
          if (trimmedCmd.startsWith('$')) {
            issues.push({
              id: `command-prompt-${line}-${index}`,
              category: 'technical',
              severity: 'info',
              message: 'Avoid including $ prompt in command examples',
              line: line,
              suggestion: 'Remove $ prompt for cleaner copy-paste experience',
              fixable: true,
              safeFix: true,
              fix: {
                type: 'replace',
                from: command,
                to: command.replace(/^\s*\$\s*/, '')
              }
            });
          }

          // Check for potentially dangerous commands
          const dangerousCommands = ['rm -rf', 'dd if=', 'mkfs', 'fdisk'];
          if (dangerousCommands.some(dangerous => trimmedCmd.includes(dangerous))) {
            issues.push({
              id: `dangerous-command-${line}-${index}`,
              category: 'technical',
              severity: 'warning',
              message: 'Potentially dangerous command in documentation',
              line: line,
              suggestion: 'Add warning or use safer alternative',
              fixable: false,
              safeFix: false
            });
          }

          // Check for curl commands with proper formatting
          if (trimmedCmd.includes('curl')) {
            if (!trimmedCmd.includes('-') && trimmedCmd.length > 20) {
              issues.push({
                id: `curl-formatting-${line}-${index}`,
                category: 'technical',
                severity: 'info',
                message: 'Complex curl command might benefit from formatting',
                line: line,
                suggestion: 'Consider using line breaks and flags for readability',
                fixable: false,
                safeFix: false
              });
            }
          }

          // Check for SAP-specific commands
          if (trimmedCmd.includes('cf ') && !trimmedCmd.includes('--help')) {
            // Check for missing target specification
            const cfCommands = ['cf push', 'cf create-service', 'cf bind-service'];
            if (cfCommands.some(cfCmd => trimmedCmd.includes(cfCmd))) {
              if (!code.includes('cf target') && !trimmedCmd.includes('-t ')) {
                issues.push({
                  id: `cf-target-missing-${line}-${index}`,
                  category: 'technical',
                  severity: 'info',
                  message: 'CF command without target context',
                  line: line,
                  suggestion: 'Consider showing cf target command or specifying org/space',
                  fixable: false,
                  safeFix: false
                });
              }
            }
          }
        });
      }

      // Check JSON/YAML configuration blocks
      if (lang === 'json' || lang === 'yaml' || lang === 'yml') {
        try {
          if (lang === 'json') {
            JSON.parse(code);
          }
          // YAML parsing would require a library, simplified here
        } catch (error) {
          issues.push({
            id: `invalid-json-${line}`,
            category: 'technical',
            severity: 'error',
            message: `Invalid ${lang} syntax`,
            line: line,
            suggestion: 'Fix syntax errors',
            fixable: false,
            safeFix: false
          });
        }

        // Check for placeholder values in configs
        const placeholders = ['<YOUR_VALUE>', '[YOUR_VALUE]', 'TODO', 'CHANGEME'];
        placeholders.forEach(placeholder => {
          if (code.includes(placeholder)) {
            issues.push({
              id: `config-placeholder-${line}`,
              category: 'technical',
              severity: 'warning',
              message: `Configuration contains placeholder: ${placeholder}`,
              line: line,
              suggestion: 'Replace with example values or clear instructions',
              fixable: false,
              safeFix: false
            });
          }
        });
      }
    });

    return issues;
  }

  /**
   * Check configuration examples for completeness
   */
  checkConfigurationExamples(context) {
    const issues = [];
    const { content } = context;

    // Check for SAP BTP destination configurations
    if (content.includes('destination') || content.includes('BTP')) {
      const configSections = this.extractConfigurationBlocks(content);

      configSections.forEach(config => {
        // Check for required destination properties
        const requiredProps = ['Name', 'Type', 'URL'];
        const missingProps = requiredProps.filter(prop => !config.content.includes(prop));

        if (missingProps.length > 0 && config.content.includes('Type')) {
          issues.push({
            id: `incomplete-destination-config-${config.line}`,
            category: 'technical',
            severity: 'warning',
            message: `Destination configuration missing properties: ${missingProps.join(', ')}`,
            line: config.line,
            suggestion: 'Add missing required properties',
            fixable: false,
            safeFix: false
          });
        }

        // Check for authentication configuration
        if (config.content.includes('Authentication') || config.content.includes('OAuth')) {
          const authProps = ['clientId', 'clientSecret', 'tokenServiceURL'];
          const hasAuthProps = authProps.some(prop => config.content.includes(prop));

          if (config.content.includes('OAuth') && !hasAuthProps) {
            issues.push({
              id: `incomplete-oauth-config-${config.line}`,
              category: 'technical',
              severity: 'warning',
              message: 'OAuth configuration missing required properties',
              line: config.line,
              suggestion: 'Add clientId, clientSecret, and tokenServiceURL',
              fixable: false,
              safeFix: false
            });
          }
        }
      });
    }

    return issues;
  }

  /**
   * Check for technical accuracy based on KM patterns
   */
  checkTechnicalAccuracy(context) {
    const issues = [];
    const { content, patterns } = context;

    // Check for technical corrections from KM patterns
    if (patterns && patterns.technical) {
      patterns.technical.forEach(pattern => {
        if (pattern.before && pattern.after && pattern.before !== pattern.after) {
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            if (line.includes(pattern.before)) {
              issues.push({
                id: `technical-accuracy-${index + 1}`,
                category: 'technical',
                severity: 'warning',
                message: 'Technical information could be more accurate',
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

    // Check for common technical inaccuracies
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Check for outdated protocol references
      if (lowerLine.includes('ssl') && !lowerLine.includes('tls')) {
        if (lowerLine.includes('certificate') || lowerLine.includes('connection')) {
          issues.push({
            id: `ssl-outdated-${index + 1}`,
            category: 'technical',
            severity: 'info',
            message: 'Consider mentioning TLS in addition to SSL',
            line: index + 1,
            suggestion: 'Use "SSL/TLS" or "TLS" for modern security',
            fixable: false,
            safeFix: false
          });
        }
      }

      // Check for version-specific information without version numbers
      const versionSensitive = [
        'current version', 'latest version', 'new feature',
        'recently added', 'now supports'
      ];

      versionSensitive.forEach(phrase => {
        if (lowerLine.includes(phrase)) {
          issues.push({
            id: `version-vague-${index + 1}`,
            category: 'technical',
            severity: 'info',
            message: `Vague version reference: "${phrase}"`,
            line: index + 1,
            suggestion: 'Specify exact version numbers when possible',
            fixable: false,
            safeFix: false
          });
        }
      });
    });

    return issues;
  }

  /**
   * Check version references and compatibility information
   */
  checkVersionReferences(context) {
    const issues = [];
    const { content } = context;

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for year references that might be outdated
      if (line.includes('2025') || line.includes('2024')) {
        const currentYear = new Date().getFullYear();
        if (currentYear > 2026) { // Only flag if significantly outdated
          issues.push({
            id: `outdated-year-${index + 1}`,
            category: 'technical',
            severity: 'info',
            message: 'Year reference might be outdated',
            line: index + 1,
            suggestion: `Consider updating to ${currentYear}`,
            fixable: true,
            safeFix: false,
            fix: {
              type: 'replace',
              from: line.match(/202[4-5]/)[0],
              to: currentYear.toString()
            }
          });
        }
      }

      // Check for Node.js version references
      const nodeVersionMatch = line.match(/node\s+(\d+)/i);
      if (nodeVersionMatch) {
        const version = parseInt(nodeVersionMatch[1]);
        if (version < 16) { // Node 16+ is recommended
          issues.push({
            id: `node-version-${index + 1}`,
            category: 'technical',
            severity: 'warning',
            message: `Node.js version ${version} is outdated`,
            line: index + 1,
            suggestion: 'Recommend Node.js 18+ for better support',
            fixable: false,
            safeFix: false
          });
        }
      }

      // Check for SAP UI5 version references
      if (line.includes('UI5') && line.match(/\d+\.\d+/)) {
        const versionMatch = line.match(/(\d+\.\d+)/);
        if (versionMatch) {
          const version = parseFloat(versionMatch[1]);
          if (version < 1.90) {
            issues.push({
              id: `ui5-version-${index + 1}`,
              category: 'technical',
              severity: 'info',
              message: `UI5 version ${version} might be outdated`,
              line: index + 1,
              suggestion: 'Consider referencing newer UI5 versions',
              fixable: false,
              safeFix: false
            });
          }
        }
      }
    });

    return issues;
  }

  // Utility methods

  getLineNumber(node) {
    return node.position ? node.position.start.line : null;
  }

  extractConfigurationBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let currentBlock = null;

    lines.forEach((line, index) => {
      // Simple detection of configuration blocks
      if (line.trim().startsWith('```') && (line.includes('json') || line.includes('yaml'))) {
        currentBlock = {
          line: index + 1,
          content: '',
          type: line.includes('json') ? 'json' : 'yaml'
        };
      } else if (currentBlock && line.trim() === '```') {
        blocks.push(currentBlock);
        currentBlock = null;
      } else if (currentBlock) {
        currentBlock.content += line + '\n';
      }
    });

    return blocks;
  }
}

export default TechnicalRules;