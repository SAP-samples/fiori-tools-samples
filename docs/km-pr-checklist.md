# KM PR Checklist - Pre-Review Validation

## Overview
This checklist ensures documentation changes meet KM standards before review, reducing review cycles and maintaining quality consistency. Follow this checklist for all documentation PRs.

## Automated Validation

### Run docs-linter Tool
Before creating your PR, run the automated checks:

```bash
# Basic check with auto-fix for safe issues
docs-linter check README.md --auto-fix-safe

# Comprehensive analysis
docs-linter check README.md --comprehensive

# Validate against KM standards
docs-linter validate README.md --km-standards
```

**Expected Results:**
- ✅ No errors (red ❌ items)
- ✅ Minimal warnings (yellow ⚠️ items)
- ✅ Quality score ≥ 75/100 for substantial documentation

## Manual Review Checklist

### 🏗️ Structure and Organization

- [ ] **Single H1 heading** - Only one main heading per document
- [ ] **Logical heading hierarchy** - No skipped levels (H1→H2→H3)
- [ ] **Required sections present** (for README files):
  - [ ] Overview/Introduction
  - [ ] Prerequisites
  - [ ] Main content (Getting Started/Configuration)
  - [ ] Additional Resources
- [ ] **Recommended sections** (for technical guides):
  - [ ] Troubleshooting or Known Issues
  - [ ] Support/Contact information
- [ ] **Table of contents** - Present for documents >10k characters with >8 headings
- [ ] **Logical section order** - Follows standard: Overview → Prerequisites → Instructions → Troubleshooting → Resources

### ✍️ Content Quality

- [ ] **No placeholder text** - No [TODO], [TBD], [Add content here], etc.
- [ ] **Complete sentences and lists** - No unfinished content after "such as:", "including:"
- [ ] **Clear, specific language** - Avoid vague terms like "appropriate," "some users," "might work"
- [ ] **Active voice preferred** - "Configure the destination" vs "The destination should be configured"
- [ ] **Consistent terminology**:
  - [ ] "on-premise" (not "onpremise" or "on premise")
  - [ ] "SAP BTP" (consistent throughout)
  - [ ] "Cloud Connector" (properly capitalized)
  - [ ] "see" vs "refer to" (prefer "see")

### 🔧 Technical Accuracy

- [ ] **All links working** - Test external and internal links
- [ ] **Current year references** - Update to 2026 where appropriate
- [ ] **HTTPS URLs** - Use secure links when available
- [ ] **Complete code examples**:
  - [ ] Proper language specification (```bash, ```json)
  - [ ] No command prompts ($ symbols) in examples
  - [ ] Valid syntax (especially JSON/YAML)
  - [ ] Realistic example values
- [ ] **Configuration completeness**:
  - [ ] All required properties shown
  - [ ] No placeholder values like `<YOUR_VALUE>` without explanation
  - [ ] Working examples that can be copy-pasted

### 📝 Formatting Consistency

- [ ] **Heading capitalization**:
  - [ ] Title case for H1, H2 (e.g., "Checklist for Support Tickets")
  - [ ] Sentence case for H3+ (e.g., "Common deployment issues")
- [ ] **List formatting**:
  - [ ] Consistent bullet markers (prefer dashes `-`)
  - [ ] Proper spacing after markers
  - [ ] Parallel sentence structure
- [ ] **Link formatting**:
  - [ ] Descriptive link text (not bare URLs)
  - [ ] Proper markdown syntax `[text](url)`
- [ ] **Code block formatting**:
  - [ ] Three backticks (not four)
  - [ ] Language specified for syntax highlighting
  - [ ] Proper indentation

### 🔍 Detail Review (Based on KM Patterns)

- [ ] **Punctuation corrections applied**:
  - [ ] "certs" not "xerts"
  - [ ] Proper semicolon/colon usage
  - [ ] Correct quotation marks
- [ ] **Style improvements**:
  - [ ] "For more information about" (not "around")
  - [ ] "The best method is to" (not "For these purposes, its best you")
  - [ ] Natural, conversational language
- [ ] **Technical precision**:
  - [ ] Specific version numbers when relevant
  - [ ] Accurate command syntax
  - [ ] Complete error messages and solutions

## Quality Validation

### Minimum Standards
- [ ] **No critical errors** - All red ❌ items resolved
- [ ] **Quality score ≥ 75** - Run `docs-linter validate README.md --km-standards`
- [ ] **Working examples** - All code can be executed successfully
- [ ] **Complete sections** - No missing required content

### Excellence Indicators
- [ ] **Quality score ≥ 90** - Meets KM excellence standards
- [ ] **Comprehensive coverage** - Addresses common user questions
- [ ] **Professional support information** - Clear escalation path for issues
- [ ] **Rich troubleshooting** - Covers common problems and solutions

## File-Specific Considerations

### README.md Files
- [ ] **Business context** - Clear explanation of what the sample/guide demonstrates
- [ ] **Prerequisites section** - All required tools, access, and knowledge
- [ ] **Step-by-step instructions** - Can be followed by a new user
- [ ] **Project structure** - File/folder organization explained
- [ ] **License information** - Appropriate licensing details

### Technical Configuration Guides
- [ ] **Environment setup** - Complete environment requirements
- [ ] **Configuration examples** - Copy-pasteable configurations
- [ ] **Validation steps** - How to verify correct setup
- [ ] **Troubleshooting section** - Common issues and resolutions
- [ ] **Support checklist** - Information needed for support tickets

### API Documentation
- [ ] **Authentication details** - How to authenticate requests
- [ ] **Complete examples** - Request and response samples
- [ ] **Error handling** - Error codes and resolution steps
- [ ] **Rate limiting** - Usage limitations and guidelines

## Common Issues to Avoid

Based on analysis of 30+ KM feedback commits:

### Frequent Problems
- [ ] ❌ **Inconsistent bullet markers** (mixing -, *, +)
- [ ] ❌ **Vague link context** ("refer to this" instead of "see")
- [ ] ❌ **Missing language in code blocks** (```bash missing)
- [ ] ❌ **Placeholder text left in** ([TODO], [TBD])
- [ ] ❌ **Broken internal links** (wrong anchor references)
- [ ] ❌ **Inconsistent terminology** (onpremise vs on-premise)

### Quality Killers
- [ ] ❌ **Multiple H1 headings** (SEO and structure problems)
- [ ] ❌ **Skipped heading levels** (H1 → H3)
- [ ] ❌ **Passive voice overuse** ("should be configured" vs "configure")
- [ ] ❌ **Outdated version references** (2024/2025 instead of 2026)
- [ ] ❌ **Incomplete configurations** (missing required properties)

## Pre-PR Testing

### Local Validation
```bash
# Run comprehensive checks
docs-linter check README.md --comprehensive

# Test auto-fixes (dry run first)
docs-linter fix README.md --dry-run
docs-linter fix README.md --safe-only

# Final validation
docs-linter validate README.md --km-standards
```

### Manual Testing
- [ ] **Link testing** - Click all external links
- [ ] **Code execution** - Run all provided commands
- [ ] **Fresh perspective** - Can someone new follow the instructions?

## Post-PR Actions

After your PR is approved:
- [ ] **Monitor for feedback** - Address any post-merge issues quickly
- [ ] **Update related docs** - Consider if changes affect other documentation
- [ ] **Share learnings** - Contribute improvements back to this checklist

## Quality Benchmarks

### Target Scores
- **Minimum for PR approval**: 75/100
- **Excellence target**: 90/100
- **Gold standard examples**: 95+/100

### Quality Examples to Reference
1. `./misc/headless/fioriui/README.md` - Comprehensive technical guide
2. `./sample-fiori-gen-ext/README.md` - Well-structured sample documentation
3. `./misc/destinations/README.md` - Professional support and troubleshooting

## Getting Help

### Before Creating PR
- Review the [KM Style Guide](km-style-guide.md)
- Check [Golden Documentation Examples](golden-docs.md)
- Run the automated docs-linter validation

### During Review Process
- Address all reviewer feedback promptly
- Use the docs-linter tool to validate fixes
- Ask for clarification on style questions

### Support Resources
- KM Style Guide: Complete standards reference
- Docs-linter tool: Automated validation and fixes
- Quality examples: Real documentation that meets standards

---
*This checklist is based on analysis of 30+ KM feedback commits*
*Updated: January 2026 | Version 1.0*