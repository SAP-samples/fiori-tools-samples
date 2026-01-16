/**
 * Template Generator - Based on Quality Examples
 *
 * Generates documentation templates based on high-quality examples
 * identified from the KM feedback analysis.
 */

const fs = require('fs');
const path = require('path');

class TemplateGenerator {
  constructor() {
    this.loadTemplateData();
  }

  /**
   * Load template data and quality examples
   */
  loadTemplateData() {
    try {
      const trainingDataPath = path.resolve(__dirname, '../../training-data');

      if (fs.existsSync(path.join(trainingDataPath, 'quality-examples.json'))) {
        const examples = JSON.parse(fs.readFileSync(
          path.join(trainingDataPath, 'quality-examples.json'),
          'utf8'
        ));
        this.qualityExamples = examples;
      }
    } catch (error) {
      console.warn('Warning: Could not load template data:', error.message);
      this.qualityExamples = [];
    }
  }

  /**
   * Generate documentation from template
   */
  async generate(templateType, options = {}) {
    switch (templateType) {
      case 'sample-app':
        return this.generateSampleAppTemplate(options);
      case 'guide':
        return this.generateGuideTemplate(options);
      case 'api':
        return this.generateAPITemplate(options);
      case 'troubleshooting':
        return this.generateTroubleshootingTemplate(options);
      default:
        return this.generateDefaultTemplate(options);
    }
  }

  /**
   * Generate sample application README template
   */
  generateSampleAppTemplate(options) {
    const template = `# Sample Application Name

## Overview
Brief description of what this sample application demonstrates. Explain the business scenario, technologies used, and learning objectives.

## Prerequisites
- SAP BTP account with Cloud Foundry runtime
- [List specific prerequisites based on the application]
- Node.js 18 or higher
- Access to SAP Business Application Studio or VS Code

## Getting Started

### 1. Clone and Setup
\`\`\`bash
git clone [repository-url]
cd [project-directory]
npm install
\`\`\`

### 2. Configuration
[Provide step-by-step configuration instructions]

### 3. Deploy and Run
\`\`\`bash
npm run build
npm start
\`\`\`

## Features Demonstrated
- [Feature 1 with brief explanation]
- [Feature 2 with brief explanation]
- [Feature 3 with brief explanation]

## Project Structure
\`\`\`
project-root/
├── app/                 # Application code
├── srv/                 # Service layer
├── db/                  # Database definitions
├── package.json         # Dependencies and scripts
└── README.md           # This file
\`\`\`

## Configuration Details
[Detailed configuration information with examples]

## Troubleshooting
### Common Issues
1. **Issue 1**: Description and solution
2. **Issue 2**: Description and solution

### Support
For support tickets, include:
- Error messages and logs
- Steps to reproduce
- Environment details

## Additional Resources
- [SAP BTP Documentation](https://help.sap.com/docs/btp)
- [Related tutorials and guides]

## License
This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

---
*Generated using KM Documentation Linter v1.0*`;

    return this.processTemplate(template, options);
  }

  /**
   * Generate technical guide template
   */
  generateGuideTemplate(options) {
    const template = `# [Guide Title]

## Overview
[Brief overview of what this guide covers and its purpose]

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Instructions](#step-by-step-instructions)
- [Configuration Details](#configuration-details)
- [Validation and Testing](#validation-and-testing)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites
- [Prerequisite 1 with link if applicable]
- [Prerequisite 2 with version requirements]
- [Access requirements and permissions]

## Step-by-Step Instructions

### Step 1: [First Major Step]
[Detailed instructions with screenshots if helpful]

\`\`\`bash
# Example commands
command-example
\`\`\`

### Step 2: [Second Major Step]
[Detailed instructions]

### Step 3: [Third Major Step]
[Detailed instructions]

## Configuration Details
[Detailed configuration with examples]

\`\`\`json
{
  "example": "configuration",
  "property": "value"
}
\`\`\`

## Validation and Testing
1. **Validate Setup**: [How to verify the configuration]
2. **Test Functionality**: [How to test that everything works]
3. **Expected Results**: [What success looks like]

## Troubleshooting

### Quick Checks
- [Quick check 1]
- [Quick check 2]
- [Quick check 3]

### Common Issues
1. **[Issue Title]**: Description and resolution
2. **[Issue Title]**: Description and resolution

### Checklist for Support Tickets
If you need to raise a support ticket, include:
- [Required information 1]
- [Required information 2]
- [Log files and error messages]

## Additional Resources
- [Related documentation]
- [Community resources]
- [Training materials]

## Known Issues
- [Known limitation 1]
- [Known limitation 2]

---
*Generated using KM Documentation Linter v1.0*`;

    return this.processTemplate(template, options);
  }

  /**
   * Generate API documentation template
   */
  generateAPITemplate(options) {
    const template = `# API Documentation

## Overview
[Brief description of the API, its purpose, and main capabilities]

## Authentication
[Authentication method and requirements]

\`\`\`http
Authorization: Bearer <token>
\`\`\`

## Base URL
\`\`\`
https://api.example.com/v1
\`\`\`

## Endpoints

### GET /resource
[Description of what this endpoint does]

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1    | string | Yes | Description |
| param2    | integer | No | Description |

**Example Request:**
\`\`\`http
GET /resource?param1=value1&param2=123
\`\`\`

**Example Response:**
\`\`\`json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Example"
  }
}
\`\`\`

### POST /resource
[Description of what this endpoint does]

**Request Body:**
\`\`\`json
{
  "name": "string",
  "description": "string"
}
\`\`\`

**Example Response:**
\`\`\`json
{
  "status": "success",
  "message": "Resource created successfully"
}
\`\`\`

## Error Handling
[Description of error response format]

**Error Response:**
\`\`\`json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
\`\`\`

## Rate Limiting
[Rate limiting information]

## Examples
[Practical examples of common use cases]

## SDKs and Libraries
[Available SDKs and code libraries]

---
*Generated using KM Documentation Linter v1.0*`;

    return this.processTemplate(template, options);
  }

  /**
   * Generate troubleshooting guide template
   */
  generateTroubleshootingTemplate(options) {
    const template = `# Troubleshooting Guide

## Overview
This guide helps you resolve common issues with [system/application name].

## Quick Diagnostic Steps
1. **Check System Status**: [How to verify system is running]
2. **Verify Configuration**: [Key configuration to check]
3. **Review Logs**: [Where to find relevant logs]

## Common Issues

### Issue 1: [Connection Problems]
**Symptoms:**
- [Symptom 1]
- [Symptom 2]

**Possible Causes:**
- [Cause 1]
- [Cause 2]

**Resolution:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Verification:**
[How to confirm the issue is resolved]

### Issue 2: [Authentication Failures]
**Symptoms:**
- [Symptom 1]
- [Symptom 2]

**Possible Causes:**
- [Cause 1]
- [Cause 2]

**Resolution:**
1. [Step 1]
2. [Step 2]

## Log Analysis
### Finding Logs
[Where to locate log files]

### Key Log Entries
\`\`\`
[Example log entries to look for]
\`\`\`

### Log Level Configuration
[How to adjust logging levels for debugging]

## Support Information
### Before Contacting Support
Collect the following information:
- [Required information 1]
- [Required information 2]
- [System configuration details]

### Support Channels
- [Support method 1]
- [Support method 2]

## Additional Resources
- [Documentation links]
- [Community forums]
- [Knowledge base articles]

---
*Generated using KM Documentation Linter v1.0*`;

    return this.processTemplate(template, options);
  }

  /**
   * Generate default template based on quality examples
   */
  generateDefaultTemplate(options) {
    const template = `# Documentation Title

## Overview
[Provide a clear overview of what this document covers]

## Prerequisites
- [List prerequisites here]

## [Main Content Section]
[Your main content goes here]

## Additional Resources
- [Link to related documentation]

## License
[License information if applicable]

---
*Generated using KM Documentation Linter v1.0*`;

    return this.processTemplate(template, options);
  }

  /**
   * Process template with options and replacements
   */
  processTemplate(template, options) {
    let processedTemplate = template;

    // Replace common placeholders
    const replacements = {
      '[repository-url]': options.repoUrl || '[REPOSITORY_URL]',
      '[project-directory]': options.projectDir || '[PROJECT_DIRECTORY]',
      '[Guide Title]': options.title || '[GUIDE_TITLE]',
      '[system/application name]': options.systemName || '[SYSTEM_NAME]'
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedTemplate = processedTemplate.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    // Add current date if not provided
    const currentDate = new Date().toISOString().split('T')[0];
    if (options.includeDate !== false) {
      processedTemplate = `<!-- Generated on ${currentDate} -->\n${processedTemplate}`;
    }

    return processedTemplate;
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return [
      {
        name: 'sample-app',
        description: 'Template for sample application documentation',
        useCase: 'Use for demo applications and code samples'
      },
      {
        name: 'guide',
        description: 'Template for technical guides and how-to documentation',
        useCase: 'Use for step-by-step instructions and configuration guides'
      },
      {
        name: 'api',
        description: 'Template for API documentation',
        useCase: 'Use for REST API documentation and reference guides'
      },
      {
        name: 'troubleshooting',
        description: 'Template for troubleshooting and support guides',
        useCase: 'Use for problem resolution and diagnostic information'
      }
    ];
  }

  /**
   * Analyze existing file to suggest template type
   */
  suggestTemplateType(filePath) {
    if (!fs.existsSync(filePath)) {
      return 'sample-app'; // Default
    }

    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

    if (content.includes('api') || content.includes('endpoint') || content.includes('rest')) {
      return 'api';
    }

    if (content.includes('troubleshooting') || content.includes('issues') || content.includes('error')) {
      return 'troubleshooting';
    }

    if (content.includes('guide') || content.includes('step') || content.includes('configuration')) {
      return 'guide';
    }

    return 'sample-app';
  }
}

module.exports = TemplateGenerator;