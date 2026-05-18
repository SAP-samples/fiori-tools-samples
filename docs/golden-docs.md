# Golden Documentation Examples

## Overview
This guide identifies exemplary documentation files in the repository that consistently receive minimal KM feedback and demonstrate best practices. Use these as references when creating or improving documentation.

## Quality Scoring Methodology

Documentation quality is scored based on:
- **Structural Quality** (30%): Heading hierarchy, section organization, completeness
- **Content Quality** (40%): Clarity, accuracy, usefulness, no placeholders
- **Technical Quality** (30%): Valid code, working links, current references

**Score Calculation:**
- Base score: 100 points
- Deductions: Errors (-10), Warnings (-5), Info issues (-2)
- Bonuses: Quality example status (+10), comprehensive coverage (+5)

## Gold Standard Examples

### 1. Destinations Guide - `./misc/destinations/README.md`
**Gold Standard Reference** | **300+ lines** | **Comprehensive Technical Guide**

**Why It's Excellent:**
- **Complete coverage**: From basic setup to advanced troubleshooting
- **Professional structure**: Clear flow from overview to deep technical details
- **Rich troubleshooting**: Extensive problem-solving section with real scenarios
- **Support readiness**: Professional support ticket checklist with required artifacts
- **Technical depth**: Includes flow diagrams, multiple endpoint examples, validation steps

**Key Strengths:**
- Mermaid sequence diagram illustrating the flow
- Multiple service endpoint examples with explanations
- Detailed curl commands with expected outputs
- Comprehensive troubleshooting section addressing real user issues
- Professional support ticket requirements

**Use This For:**
- Technical configuration guides
- API integration documentation
- Troubleshooting-heavy guides

**Representative Sections:**
```markdown
## Flow Diagram
[Includes professional Mermaid diagram]

## Sample Microsoft OData XML Service Endpoints
[Multiple working examples with context]

## Troubleshooting
### Quick Checks
[Systematic diagnostic approach]
```

### 2. Headless Fiori UI - `./misc/headless/fioriui/README.md`
**Quality Score: 55.9** | **36,941 bytes** | **Stable & Comprehensive**

**Why It's Excellent:**
- **Comprehensive scope**: Covers complete headless UI implementation
- **Stable content**: Only 1 recent commit indicating maturity
- **Technical depth**: Detailed implementation with code examples
- **Clear structure**: Logical progression from setup to advanced topics

**Key Strengths:**
- Extensive technical implementation details
- Well-organized code examples
- Clear prerequisites and setup instructions
- Comprehensive coverage without being overwhelming

**Use This For:**
- Complex technical implementations
- Headless/UI5 development guides
- Multi-step technical processes

### 3. Fiori Generator Extension - `./sample-fiori-gen-ext/README.md`
**Quality Score: 55.4** | **13,389 bytes** | **Sample Application Documentation**

**Why It's Excellent:**
- **Sample app focus**: Perfect template for demo/sample documentation
- **No recent changes**: 16 total commits, 0 recent = stable, quality content
- **Balanced detail**: Comprehensive without being overwhelming
- **Good structure**: Clear flow for sample application documentation

**Key Strengths:**
- Clear business context and use case explanation
- Step-by-step setup and configuration
- Appropriate level of detail for sample code
- Good balance of overview and technical detail

**Use This For:**
- Sample application README files
- Demo project documentation
- Quick-start guides

### 4. CI/CD Guide - `./misc/cicd/README.md`
**Quality Score: 32.2** | **6,227 bytes** | **Focused Technical Guide**

**Why It's Good:**
- **Focused scope**: Clear, specific topic coverage
- **Stable content**: No recent changes indicate quality baseline
- **Appropriate length**: Right-sized for the topic
- **Technical accuracy**: Solid technical implementation guide

**Use This For:**
- Focused technical topics
- CI/CD and automation guides
- Medium-length technical documentation

### 5. CAP Fiori Hybrid - `./cap/cap-fiori-hybrid/README.md`
**Quality Score: 27.1** | **5,145 bytes** | **Hybrid Development Guide**

**Why It's Useful:**
- **Hybrid architecture**: Good example of complex topic handling
- **Recent updates**: Shows active maintenance while maintaining quality
- **Clear scope**: Focused on specific development pattern

**Use This For:**
- Hybrid development scenarios
- CAP-related documentation
- Architecture-specific guides

## Quality Patterns Analysis

### Structural Excellence Patterns

**Consistent Section Ordering:**
1. Overview/Title
2. Prerequisites
3. Step-by-step instructions
4. Configuration details
5. Troubleshooting/Known issues
6. Additional resources

**Heading Hierarchy Best Practices:**
- Single H1 title
- Logical H2 main sections
- H3 subsections as needed
- No level skipping

**Table of Contents Usage:**
- Present in longer documents (>10k characters)
- Links to all major sections
- Clean, navigable structure

### Content Excellence Patterns

**Clear Business Context:**
- Every guide starts with "why" not just "how"
- Business scenarios clearly explained
- Value proposition articulated upfront

**Complete Prerequisites:**
- Specific version requirements
- Required access and permissions
- Knowledge assumptions clearly stated
- Links to prerequisite setup guides

**Step-by-Step Clarity:**
- Numbered steps with clear outcomes
- Command examples that work as-is
- Expected results clearly stated
- Validation steps provided

### Technical Excellence Patterns

**Code Quality:**
- All code blocks have language specification
- Commands are copy-pasteable (no $ prompts)
- JSON/YAML examples are valid
- Realistic example values used

**Link Quality:**
- All external links working and current
- Internal links properly anchored
- HTTPS used when available
- Descriptive link text (no bare URLs)

**Support Information:**
- Clear escalation path for issues
- Required information for support tickets
- Common issues and solutions provided
- Contact information current

## Anti-Patterns to Avoid

Based on lower-scoring documentation:

### Structural Problems
- ❌ Multiple H1 headings
- ❌ Skipped heading levels (H1 → H3)
- ❌ Missing required sections (Overview, Prerequisites)
- ❌ Illogical section ordering

### Content Problems
- ❌ Placeholder text ([TODO], [TBD])
- ❌ Vague instructions ("configure appropriately")
- ❌ Missing business context
- ❌ Incomplete prerequisites

### Technical Problems
- ❌ Broken links
- ❌ Invalid code examples
- ❌ Missing language in code blocks
- ❌ Outdated version references

## Using These Examples

### For New Documentation
1. **Choose a similar example**: Match your content type to the most similar gold standard
2. **Follow the structure**: Use the same section ordering and hierarchy
3. **Match the tone**: Professional, clear, action-oriented
4. **Include troubleshooting**: All technical guides need problem-solving sections

### For Improving Existing Documentation
1. **Compare structure**: Does your doc follow the same logical flow?
2. **Check completeness**: Are you missing sections present in quality examples?
3. **Review technical details**: Are your examples as complete and accurate?
4. **Validate support information**: Do you provide the same level of troubleshooting help?

### Quality Benchmarking
1. **Run docs-linter**: `docs-linter validate README.md --km-standards`
2. **Compare scores**: Target the scores of these examples or higher
3. **Check against patterns**: Review your content against the excellence patterns above
4. **Test usability**: Can someone new follow your documentation successfully?

## Continuous Quality Improvement

### Regular Reviews
- **Monthly**: Review quality scores and identify declining documentation
- **Quarterly**: Update this list with new quality examples
- **Annually**: Refresh patterns based on evolved standards

### Quality Metrics Tracking
- Monitor average quality scores across repository
- Track which documentation receives most KM feedback
- Identify patterns in user questions and support requests

### Community Contributions
- Nominate documentation for quality example status
- Share improvements and patterns discovered
- Contribute to KM style guide evolution

## Quality Example Verification

To verify a document meets quality example standards:

```bash
# Check quality score
docs-linter validate README.md --km-standards

# Comprehensive analysis
docs-linter check README.md --comprehensive

# Compare to current examples
git log --oneline README.md | head -5
```

**Quality Example Criteria:**
- Quality score ≥ 90/100
- Minimal recent KM feedback (< 3 commits in 6 months)
- Substantial content (> 5,000 bytes)
- Complete structure with all recommended sections
- Working code examples and links

## Template Generation

Generate documentation based on these examples:

```bash
# Generate using quality patterns
docs-linter template --type=guide --output=NEW_README.md

# Use specific example as template
docs-linter template --type=sample-app --output=SAMPLE_README.md
```

The template generator incorporates patterns from these quality examples to ensure new documentation starts with proven structures and content approaches.

---
*Quality examples identified through analysis of commit history, KM feedback patterns, and automated quality scoring*
*Last updated: January 2026 | Based on 5 top-scoring documentation files*