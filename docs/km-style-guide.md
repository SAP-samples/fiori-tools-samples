# KM Style Guide - Documentation Standards

## Overview
This style guide codifies Knowledge Management (KM) team standards derived from analysis of feedback patterns across 30+ commits and quality examples. Following these guidelines reduces review cycles and ensures consistency across all repository documentation.

## Document Structure Standards

### Required Sections (for README files)
1. **Overview/Introduction** - Clear explanation of purpose and scope
2. **Prerequisites** - Required knowledge, tools, and access
3. **Main Content** - Step-by-step instructions or feature descriptions
4. **Additional Resources** - Links to related documentation

### Recommended Sections
- **Getting Started** - Quick start instructions
- **Configuration Details** - In-depth configuration information
- **Troubleshooting** - Common issues and solutions (required for technical guides)
- **Known Issues** - Current limitations and workarounds

### Section Ordering
Follow this standard order based on quality examples:
1. Overview
2. Table of Contents (for documents >10k characters with >8 headings)
3. Prerequisites
4. Getting Started/Configuration Steps
5. Usage/Examples
6. Troubleshooting/Known Issues
7. Additional Resources
8. License

## Heading Standards

### Hierarchy Rules
- Use only one H1 (`#`) per document
- Don't skip heading levels (H1 → H2 → H3, never H1 → H3)
- Use descriptive, specific headings

### Capitalization
- **Main sections (H1, H2)**: Use title case
  - ✅ "Checklist for Support Tickets"
  - ❌ "Support ticket checklist"
- **Subsections (H3+)**: Use sentence case
  - ✅ "Common causes for deployment errors"
  - ❌ "Common Causes For Deployment Errors"

### Examples from KM Feedback
| Before | After | Reason |
|--------|--------|--------|
| Support ticket checklist | Checklist for Support Tickets | More descriptive and professional |
| Issue 6. Standard OData services not showing | Issue 6: Standard OData Services Are Not Displayed | Consistent formatting and clarity |
| Step 1: Screenshots Required | Step 1: Provide Screenshots | Active voice, clearer instruction |

## Formatting Standards

### Lists
- **Consistency**: Use dashes (`-`) consistently throughout the document
- **Spacing**: Single space after marker
- **Parallel structure**: Keep list items grammatically consistent

### Links
- **Context phrases**: Use "see" instead of "refer to"
  - ✅ "For more information about destinations, see this [guide](url)"
  - ❌ "For more information around destinations, refer to this [guide](url)"
- **Descriptive text**: Use meaningful link text instead of bare URLs
- **Link validation**: Ensure all links are working and use HTTPS when possible

### Code Blocks
- **Language specification**: Always specify language for syntax highlighting
  ```bash
  # Good - with language
  npm install
  ```
- **Fence format**: Use three backticks (```) not four (````)
- **Command examples**: Don't include $ prompt in commands for better copy-paste
  - ✅ `cf push my-app`
  - ❌ `$ cf push my-app`

## Writing Style Standards

### Language and Tone
- **Active voice**: Preferred over passive voice
  - ✅ "Configure the destination"
  - ❌ "The destination should be configured"
- **Specific language**: Avoid vague terms
  - ✅ "Set the timeout to 60000 milliseconds"
  - ❌ "Set an appropriate timeout value"
- **Natural phrasing**: Use modern, conversational language
  - ✅ "The best method is to clone your existing destination"
  - ❌ "For these purposes, its best you clone your existing destination"

### Common Corrections from KM Feedback
| Incorrect | Correct | Context |
|-----------|---------|---------|
| onpremise | on-premise | Always use hyphenated form |
| xerts | certs | Typo in certificate context |
| around (preposition) | about | "For more information about" |
| 4. | - | Use dashes for list items, not numbers |
| clear reproduction steps and expected versus actual behavior | Clear reproduction steps and expected versus actual behavior. | Proper sentence structure |

## Technical Accuracy Standards

### Version References
- Specify exact versions when possible instead of "current" or "latest"
- Update year references regularly (current year: 2026)
- Include compatibility information for major version changes

### URLs and Links
- Use HTTPS instead of HTTP when available
- Validate SAP documentation links regularly
- Correct format: `[descriptive text](https://help.sap.com/path)`

### Command Syntax
- Provide complete, runnable commands
- Include context (working directory, prerequisites)
- Use proper escape sequences and quoting

### Configuration Examples
- Include all required properties
- Use realistic example values (not placeholders when possible)
- Validate JSON/YAML syntax

## Content Quality Standards

### Completeness Checks
- No placeholder text (`[TODO]`, `[TBD]`, `[Add content here]`)
- Complete lists after introductory phrases ("such as:", "including:")
- Working internal links (check anchor references)

### Clarity Requirements
- Explain acronyms on first use
- Provide context for complex procedures
- Include expected outcomes for validation steps

### Examples and Code Snippets
- Substantial code blocks should have explanations
- Include both positive and error cases where helpful
- Use realistic data in examples

## Punctuation and Spacing

### Consistency Rules
- Single space between sentences
- No trailing spaces at line ends
- Consistent punctuation in similar contexts
  - Use periods after complete sentences in lists
  - Use colons after introductory phrases

### Special Characters
- Use proper quotation marks (`"` not `"`)
- Use en-dashes (`–`) for ranges, em-dashes (`—`) for breaks
- Be consistent with bullet points (•, -, *)

## Quality Indicators

Based on analysis of high-scoring documentation files:

### Structural Quality
- Clear heading hierarchy (score impact: ±10 points)
- Logical section ordering (score impact: ±5 points)
- Complete required sections (score impact: ±15 points)

### Content Quality
- No placeholder text (score impact: ±20 points)
- Working links and references (score impact: ±10 points)
- Specific, actionable instructions (score impact: ±10 points)

### Technical Quality
- Valid code syntax (score impact: ±15 points)
- Current version references (score impact: ±5 points)
- Complete configuration examples (score impact: ±10 points)

## Validation Process

### Pre-Review Checklist
1. **Structure**: Verify heading hierarchy and section order
2. **Links**: Test all external and internal links
3. **Code**: Validate syntax in all code blocks
4. **Consistency**: Check terminology and formatting consistency
5. **Completeness**: Ensure no placeholder content remains

### Automated Checks
Use the docs-linter tool to automatically validate:
```bash
# Check for issues
docs-linter check README.md

# Apply safe fixes
docs-linter fix README.md --safe-only

# Validate against KM standards
docs-linter validate README.md --km-standards
```

## Quality Examples

The following files demonstrate excellent adherence to these standards:

1. `./misc/headless/fioriui/README.md` (Quality Score: 55.9)
   - Comprehensive coverage with clear structure
   - Consistent formatting throughout
   - Technical accuracy and completeness

2. `./sample-fiori-gen-ext/README.md` (Quality Score: 55.4)
   - Well-organized sections with logical flow
   - Good balance of overview and detail
   - Effective use of examples

3. `./misc/destinations/README.md` (Gold Standard)
   - Extensive technical detail with clarity
   - Excellent troubleshooting section
   - Professional support ticket checklist

## Continuous Improvement

This style guide evolves based on:
- Ongoing KM feedback analysis
- Quality score trends
- Community contributions
- SAP documentation standard updates

For updates or suggestions, please refer to the latest KM feedback patterns and quality examples analysis.

---
*Based on analysis of 30+ KM feedback commits and 5 quality documentation examples*
*Last updated: January 2026*