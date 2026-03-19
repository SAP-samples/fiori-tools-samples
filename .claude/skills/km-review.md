# KM Documentation Review

Applies comprehensive Knowledge Management (KM) team standards to README and documentation files, providing structured feedback and optional auto-fixes.

## Usage

```
/km-review <file-path>
/km-review <file-path> --fix
/km-review <file-path> --score-only
/km-review <file-path> --ai-only (skip docs-linter, AI review only)
```

## Description

This skill performs a comprehensive KM standards review on documentation files, checking for:
- Heading capitalization (Chicago title case for all headings H1–H6)
- Punctuation: Oxford comma in lists of three or more items; em dashes (—) without surrounding spaces for parenthetical phrases; en dashes (–) for ranges; no spaced em dashes ( — )
- List formatting consistency (dashes vs asterisks)
- Link phrasing ("see" vs "refer to", "about" vs "around")
- Code block formatting (no $ prompts, proper language tags)
- SAP terminology consistency (on-premise, SAP BTP, etc.)
- Document structure and completeness
- Technical accuracy and clarity

## Instructions

When this skill is invoked:

1. **Parse the command arguments**:
   - Extract file path (required)
   - Check for `--fix` flag (optional: apply safe fixes automatically)
   - Check for `--score-only` flag (optional: return only quality score)
   - Check for `--ai-only` flag (optional: skip docs-linter, use AI review only)

2. **Validate the file**:
   - Verify the file exists
   - Confirm it's a markdown file (.md extension)
   - Read the file content

3. **Load KM standards context**:
   - Read `prompts/km-doc-review.md` for the complete review prompt
   - Read `docs/km-style-guide.md` for standards reference
   - Read `training-data/km-feedback-patterns.json` if available

4. **Optional: Run docs-linter first** (unless --ai-only flag is provided):
   - Run: `node docs-linter/src/cli.js validate [FILE] --json`
   - If successful, collect linter findings for merging with AI review
   - If linter fails, continue with AI-only review
   - Note: docs-linter is now fully ESM-compatible and operational

5. **Spawn a Task agent** with `subagent_type: "general-purpose"` and pass this prompt:

```
You are a senior technical documentation reviewer for the SAP Knowledge Management (KM) team. Your task is to review the following markdown file against established KM documentation standards.

## File to Review

File path: [FILE_PATH]

Content:
```markdown
[FILE_CONTENT]
```

## KM Standards to Apply

[INSERT FULL CONTENT FROM prompts/km-doc-review.md HERE]

## Additional Context from KM Style Guide

[INSERT KEY SECTIONS FROM docs/km-style-guide.md HERE]

## Docs-Linter Findings (if available)

[IF docs-linter was run successfully, INSERT ITS FINDINGS HERE with this format:]

The automated docs-linter has already identified the following objective issues:

```json
[LINTER_FINDINGS_JSON]
```

Your task is to:
1. Validate and enhance these linter findings with context
2. Identify additional issues the linter may have missed
3. Provide comprehensive explanations for why each issue matters
4. Add any subjective/contextual issues that require human judgment

## Review Instructions

1. **Analyze the document** against all KM standards
2. **Categorize findings** by:
   - Structural issues (heading hierarchy, section ordering, TOC)
   - Formatting issues (lists, code blocks, links)
   - Content issues (clarity, terminology, completeness)
   - Technical issues (accuracy, examples, working links)

3. **For each finding, provide**:
   - Severity: critical | major | minor | info
   - Category: structural | formatting | content | technical
   - Line number (if applicable)
   - Current text (exact quote)
   - Suggested fix (exact replacement)
   - Explanation (why this matters per KM standards)
   - Is it safe to auto-fix? (boolean)

4. **Calculate a quality score** (0-100):
   - Start at 100
   - Deduct points based on severity and frequency
   - Use the scoring rules from the KM standards

5. **Provide recommendations**:
   - Prioritized list of improvements
   - References to KM style guide sections
   - Examples from quality documentation

## Output Format

Return your review as structured JSON:

```json
{
  "file": "[FILE_PATH]",
  "qualityScore": {
    "overall": 85,
    "breakdown": {
      "structure": 9,
      "clarity": 8,
      "maintainability": 9,
      "developerUsability": 8
    },
    "rationale": "Brief explanation of score"
  },
  "findings": [
    {
      "severity": "major",
      "category": "formatting",
      "line": 42,
      "current": "### Cloud Connector Configuration",
      "suggested": "### Cloud Connector Configuration",
      "explanation": "All headings (H1–H6) must use Chicago title case per KM standards. 'Configuration' is a major word and should be capitalized.",
      "safeToAutoFix": true
    }
  ],
  "summary": {
    "total": 12,
    "critical": 0,
    "major": 4,
    "minor": 6,
    "info": 2,
    "autoFixable": 8
  },
  "recommendations": [
    "Review heading capitalization rules in KM style guide",
    "Consider updating Table of Contents to use dashes instead of asterisks"
  ]
}
```
```

5. **Process the agent's response**:
   - Parse the JSON output
   - If docs-linter was used, merge and deduplicate findings
   - If `--score-only` flag: Display only the quality score and exit
   - Otherwise: Display formatted findings

6. **If `--fix` flag is provided**:
   - Filter findings where `safeToAutoFix: true`
   - Apply fixes to the file using the Edit tool
   - Create a backup comment showing what was changed
   - Display summary of applied fixes

7. **Format the output** for the user:

```
📊 KM Documentation Review: [FILE_NAME]

Quality Score: [SCORE]/100
├─ Structure: [SCORE]/10
├─ Clarity: [SCORE]/10
├─ Maintainability: [SCORE]/10
└─ Developer Usability: [SCORE]/10

Findings: [TOTAL] ([CRITICAL] critical, [MAJOR] major, [MINOR] minor, [INFO] info)

[If --fix applied:]
✅ Auto-fixed [COUNT] issues

Critical Issues:
[List critical findings with line numbers and explanations]

Major Issues:
[List major findings]

Minor Issues:
[List minor findings]

Recommendations:
- [Recommendation 1]
- [Recommendation 2]

[If not --fix:]
To automatically fix safe issues, run: /km-review [FILE_PATH] --fix
```

## Examples

### Example 1: Basic Review

**Input:**
```
/km-review misc/onpremise/README.md
```

**Output:**
```
📊 KM Documentation Review: misc/onpremise/README.md

Quality Score: 88/100
├─ Structure: 9/10
├─ Clarity: 9/10
├─ Maintainability: 9/10
└─ Developer Usability: 8/10

Findings: 5 (0 critical, 2 major, 3 minor, 0 info)

Major Issues:

Line 86: Heading capitalization
  Current: ### Cloud Connector Configuration
  Suggested: ### Cloud Connector Configuration
  → All headings (H1–H6) use Chicago title case — this heading is already correct

Line 90: Heading capitalization
  Current: ### SAP BTP destination
  Suggested: ### SAP BTP Destination
  → All headings must use Chicago title case; 'Destination' is a major word and must be capitalized

Minor Issues:

Line 7: Table of Contents formatting
  Current: * [Overview](#overview)
  Suggested: - [Overview](#overview)
  → Use dashes (-) instead of asterisks (*) for list markers

[... more findings ...]

Recommendations:
- Review heading capitalization rules in docs/km-style-guide.md
- Update Table of Contents to use consistent dash markers
- All findings are safe to auto-fix

To automatically fix these issues, run: /km-review misc/onpremise/README.md --fix
```

### Example 2: With Auto-Fix

**Input:**
```
/km-review misc/destinations/README.md --fix
```

**Output:**
```
📊 KM Documentation Review: misc/destinations/README.md

Quality Score: 92/100 (before fixes)

Findings: 8 (0 critical, 2 major, 6 minor, 0 info)

✅ Auto-fixed 8 issues:
  ✓ Fixed 2 heading capitalization issues
  ✓ Fixed 4 "refer to" → "see" replacements
  ✓ Fixed 1 "around" → "about" replacement
  ✓ Fixed 1 Table of Contents format

Changes applied to misc/destinations/README.md

New Quality Score: 98/100
└─ All auto-fixable issues resolved

Remaining Issues: None

The file has been updated with KM standards. Review the changes with:
  git diff misc/destinations/README.md
```

### Example 3: Score Only

**Input:**
```
/km-review misc/sslcerts/README.md --score-only
```

**Output:**
```
📊 KM Quality Score: misc/sslcerts/README.md

Overall: 95/100
├─ Structure: 10/10
├─ Clarity: 9/10
├─ Maintainability: 10/10
└─ Developer Usability: 9/10

Status: ✅ Excellent - Meets KM standards

For detailed findings, run: /km-review misc/sslcerts/README.md
```

## Error Handling

- If file doesn't exist: "Error: File not found: [FILE_PATH]"
- If not a markdown file: "Error: Only markdown files (.md) are supported"
- If agent fails: "Error: KM review agent failed. Please try again or review manually."
- If --fix fails: "Error: Failed to apply fixes. File unchanged. Findings available above."

## Implementation Notes

1. **Performance**: The review agent may take 10-20 seconds for large files
2. **Safety**: Only apply auto-fixes where `safeToAutoFix: true`
3. **Context**: The agent has full access to KM standards and training data
4. **Scoring**: Quality scores are calibrated against repository quality examples
5. **Git-Friendly**: Applied fixes generate clean diffs suitable for commits

## Related Files

- `prompts/km-doc-review.md` - Full KM review prompt (v2.0)
- `docs/km-style-guide.md` - Complete KM standards reference
- `docs/km-pr-checklist.md` - PR review checklist
- `training-data/km-feedback-patterns.json` - Feedback pattern analysis
- `.claude/skills/customer-tone.md` - Related skill for customer communications
