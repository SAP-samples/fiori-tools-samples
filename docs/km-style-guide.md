# KM Style Guide - Documentation Standards

## Overview

This style guide codifies Knowledge Management (KM) team standards derived from analysis of feedback patterns across 30+ commits and quality examples. Following these guidelines reduces review cycles and ensures consistency across all repository documentation.

## Document Structure Standards

### Required Sections (for README files)

1. Overview/Introduction - Clear explanation of purpose and scope
2. Prerequisites - Required knowledge, tools, and access
3. Main Content - Step-by-step instructions or feature descriptions
4. Additional Resources - Links to related documentation

### Prerequisites List Style

Each bullet point in a Prerequisites section must start with "You have" or "You are":

- ✅ "You have Node.js installed."
- ✅ "You are familiar with SAP Fiori development tooling."
- ❌ "Node.js is installed."
- ❌ "Familiarity with SAP Fiori development tooling"

### Recommended Sections

- Getting Started - Quick start instructions
- Configuration Details - In-depth configuration information
- Troubleshooting - Common issues and solutions (required for technical guides)
- Known Issues - Current limitations and workarounds

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

**License section**: Always use H2 (`##`) for the License heading, regardless of surrounding heading depth.

## Heading Standards

### Hierarchy Rules

- Use only one H1 (`#`) per document.
- Do not skip heading levels (H1 → H2 → H3, never H1 → H3).
- Do not end headings with a colon or a question mark.

### Capitalization

All headings (H1–H6) use **Chicago-style title case**.

#### Chicago Title Case Rules

- Capitalize the first and last word always.
- Capitalize all major words: nouns, verbs, which includes participles such as "Using", adjectives, adverbs, and pronouns.
- Lowercase articles: *a*, *an*, *the*.
- Lowercase short prepositions (four letters or fewer): *in*, *of*, *on*, *for*, *to*, *at*, *by*, *up*, *with*.
- Lowercase coordinating conjunctions: *and*, *but*, *or*, *nor*, *yet*, *so*.

Examples:

- ✅ "Checklist for Support Tickets" (*for* is lowercase)
- ✅ "Additional Resources for Deployment" (*for* is lowercase)
- ✅ "How It Works" (*It* is capitalized as a pronoun)
- ✅ "When to Use It" (*to* is lowercase, *Use* and *It* are capitalized)
- ✅ "Using Cloud Connector" (*Using* is a participle/verb form — capitalize)
- ✅ "Running the Application Locally" (*Running* is a participle — capitalize)
- ❌ "Support ticket checklist" (not title case)
- ❌ "When to use it" (sentence case — incorrect for all heading levels)
- ❌ "Additional Resources For Deployment" (*For* should be lowercase)
- ❌ "Using cloud connector" (*Using* must be capitalized as a verb form)

#### Specific Heading Patterns

- **Table of Contents label**: Use "Table of Contents" (title case).
- **License heading**: Always `## License` (H2), never H3 or lower.
- **Support heading**: Use "Help and Support", not "Get Support" or "Get Help".
- **Prerequisites heading**: Use "Prerequisites" — no hyphen, no colon at the end.
- **Setup heading**: Prefer "How to Run Locally" or "Run Locally" over "Setup and Run Locally".
- **Troubleshooting heading**: Use "Troubleshooting" or "Errors", not "Gotchas".
- **Step headings**: Do not use "Step X:" or "Step X." as a heading prefix. Use a descriptive heading, prefix the heading with the step number, and represent the sequence as an ordered list in the Table of Contents.
  - ✅ `## 1. Configure Trust in the SAP BTP Subaccount` with `1. [Configure Trust…](#1-configure-trust…)` in the ToC
  - ❌ `## Step 1: Configure Trust in the SAP BTP Subaccount`
- **Issue headings**: Do not use "Issue N" or "Issue N:" as a heading prefix. Use a descriptive heading that summarises the problem.
  - ✅ `### Deployment Fails with HTTP 403`
  - ❌ `### Issue 2. Deployment Fails with HTTP 403`
  - ❌ `### Issue 2`

### Examples from KM Feedback

| Before | After | Reason |
|--------|--------|--------|
| Support ticket checklist | Checklist for Support Tickets | More descriptive and professional |
| Issue 6. Standard OData services not showing | Issue 6: Standard OData Services Are Not Displayed | Consistent formatting and clarity |
| Step 1: Screenshots Required | Step 1: Provide Screenshots | Active voice, clearer instruction |
| Get Support | Help and Support | Standard heading pattern |
| Pre-requisites: | Prerequisites | No hyphen, no trailing colon |
| Setup and Run Locally | Run Locally | Concise and direct |

## Formatting Standards

### Lists

- **Unordered lists**: Use dashes (`-`) as the marker, not asterisks (`*`). This applies throughout the document, which includes the Table of Contents.
- **Ordered lists**: Use numbered lists for sequential, procedural steps where order matters.
- **Single-item lists**: Do not use an ordered list with only one item — convert to a bullet or prose sentence.
- **Do not count list items in prose**: Do not state the number of items before a list. Use "the following" instead.
  - ✅ "it's related to the following configuration issues:"
  - ❌ "it's related to two configuration issues:"
- **Spacing**: Single space after marker.
- **Parallel structure**: Keep list items grammatically consistent.
- **Punctuation**: Use periods after complete sentences in list items.
- **No semicolons in prose**: Do not use semicolons in body text. Replace with a colon (when the second clause expands or introduces the first) or a period (when both clauses are independent). Semicolons inside code blocks and inline code are unaffected.
  - ✅ "You need the following properties:" (introduces a list)
  - ✅ "The deployment fails. Check the logs." (two independent statements)
  - ❌ "You need the following properties; clientid, clientsecret, url"
- **Oxford comma**: Always use the Oxford comma in lists of three or more items. For two-item lists in prose — which includes parenthetical examples — use "and" or "or" without a preceding comma.
  - ✅ "Configure the URL, authentication, and proxy type" (three items — Oxford comma)
  - ✅ "Configure the URL and proxy type" (two items — no comma)
  - ✅ "Build tools (`@ui5/cli` and `@sap/ux-ui5-tooling`)" (two-item parenthetical)
  - ❌ "Configure the URL, authentication and proxy type" (three items — missing Oxford comma)
  - ❌ "Configure the URL, and proxy type" (two items — comma before "and")
  - ❌ "Build tools (`@ui5/cli`, `@sap/ux-ui5-tooling`)" (two-item parenthetical — needs "and")
- **Em dashes or arrows in list items**: Replace `—` or `→` with a colon.
  - ✅ `- **Field**: Description of the field`
  - ❌ `- **Field** — Description of the field`

### Numbers

- **Spell out** numbers one through ten in prose text.
  - ✅ "There are three configuration steps."
  - ❌ "There are 3 configuration steps."
- **Use numerals** for 11 and above.
  - ✅ "The timeout is set to 60000 milliseconds."
  - ✅ "There are 15 properties in this destination."
- **Exceptions**: Always use numerals for version numbers, code values, measurements, error codes, and numeric ranges regardless of size.

### Links

- **Preferred phrasing**: Use "For more information, see [Title](url)" instead of "refer to this link", "follow this tutorial", "please refer to", or "see this blog post".
- **Related Links and Additional Resources sections**: Use bare link bullets with no "For more information, see" prefix. No trailing period on link-only bullets.
  - ✅ `- [Integrating SAP Business Application Studio](url)`
  - ❌ `- For more information, see [Integrating SAP Business Application Studio](url).`
- **Prepositions**: Use "about" not "around" in link context.
  - ✅ "For more information about destinations, see the [Destination Guide](url)"
  - ❌ "For more information around destinations, refer to this [guide](url)"
- **Link text type words**: Do not include "tutorial", "guide", "blog post", or "article" inside the link text. Move the type word to prose immediately after the link.
  - ✅ "see the [SAP HANA Cloud Service Instance](url) tutorial"
  - ✅ "see the [Node.js](url) documentation"
  - ❌ "see the [SAP HANA Cloud Service Instance Tutorial](url)"
- **Descriptive text**: Use meaningful link text, not bare URLs.
- **Protocol**: Use HTTPS when available.

### Code Blocks

- **Language specification**: Always specify the language for syntax highlighting.
  ```bash
  npm install
  ```
- **Fence format**: Use three backticks (```) not four.
- **Command examples**: Do not include a `$` prompt prefix — it interferes with copy-paste.
  - ✅ `cf push my-app`
  - ❌ `$ cf push my-app`

## Writing Style Standards

### Language and Tone

- **Active voice**: Preferred over passive voice.
  - ✅ "Configure the destination."
  - ❌ "The destination should be configured."
- **Present tense**: Use present tense in instructions, not future tense.
  - ✅ "The application opens in a new tab."
  - ❌ "The application will open in a new tab."
- **Remove "please"**: Do not use "please" in instructions.
  - ✅ "Run the following command."
  - ❌ "Please run the following command."
- **"like" → "such as"**: Use "such as" when introducing examples. Reserve "like" for natural-language simile only.
  - ✅ "Build tooling such as `mbt`"
  - ❌ "Build tooling like `mbt`"
- **Parentheses**: Avoid parentheses except when spelling out an abbreviation on first use. For examples, use "such as" in running prose. For qualifiers and asides, rephrase inline using a comma, "that is,", or a new sentence as appropriate. For contrast, use "and not" inline rather than a `(not ...)` parenthetical.
  - ✅ "Build tooling such as `mbt` (Multi-Target Application Archive Builder)" (abbreviation — keep)
  - ✅ "Build tooling such as `mbt`" (example — no brackets needed)
  - ✅ "file extensions don't matter, such as `.pem`, `.crt` and `.cert`" (qualifier as comma)
  - ✅ "using `http://` and not `https://`" (contrast inline)
  - ❌ "Build tooling (`mbt`, other tools)" (example in brackets)
  - ❌ "using `http://` (not `https://`)" (contrast in brackets)
- **"In order to" → "To"**: Use the shorter form.
  - ✅ "To deploy the application, run:"
  - ❌ "In order to deploy the application, run:"
- **"might" → "may"**: Always use "may" for possibility in technical prose.
  - ✅ "You may encounter an issue where…"
  - ❌ "You might encounter an issue where…"
- **"including" → "which includes/include"**: Replace "including" used as a connective with "which includes" (singular subject) or "which include" (plural subject). Reserve "including" only where it cannot be rephrased.
  - ✅ "This applies throughout the document, which includes the Table of Contents."
  - ✅ "The full dependency graph, which includes both dependencies and `devDependencies`."
  - ❌ "This applies throughout the document, including the Table of Contents."
- **Remove "simply"**: The word adds no meaning.
  - ✅ "Run `npm install`."
  - ❌ "Simply run `npm install`."
- **Remove "currently"**: The word is almost always redundant in technical prose — present tense already implies the current state.
  - ✅ "A limited set of prompts can be customized."
  - ❌ "Currently a limited set of prompts can be customized."
- **"It is also possible to" → "You can also"**: Use the direct second-person form.
  - ✅ "You can also run the application with mock data."
  - ❌ "It is also possible to run the application with mock data."
- **JSON capitalisation**: Always write "JSON" in uppercase in prose. Never write "json" as a plain word. Filenames such as `package.json` are unaffected.
  - ✅ "The `Inquirer.js` JSON structure"
  - ❌ "The Inquirer-js json structure"
- **GUI capitalisation**: Always write "GUI" in uppercase in prose.
  - ✅ "Set these variables through the Windows GUI."
  - ❌ "Set these variables through the Windows gui."
- **"below" → "following"**: Do not use "below" to refer to content later in the document. Use "following" or link directly to the section. Do not use "above" to refer to content earlier in the document. Use "For more information, see [Section](#anchor)" instead. Exception: "below" is acceptable when comparing numeric values, such as HTTP status codes.
  - ✅ "using the following instructions"
  - ✅ "See [Configuring Environment Variables](#configuring-environment-variables) for instructions"
  - ❌ "using the instructions below"
  - ❌ "See [Configuring Environment Variables](#configuring-environment-variables) below for instructions"
- **"will" → present tense**: Replace future tense with present tense. This applies to descriptions of system behavior, outcomes, and instructions. Convert passive future constructions to active present.
  - ✅ "This opens the configuration panel."
  - ✅ "The server validates the certificate."
  - ❌ "This will open the configuration panel."
  - ❌ "The server will validate the certificate."
- **Dangling participles ("…, -ing")**: Do not use a trailing participial phrase joined by a comma to describe a consequence or result. Use "which + verb" instead.
  - ✅ "Certificate validation is disabled, which allows connections to servers with invalid certificates."
  - ✅ "The router appends the service path, which makes the effective request:"
  - ❌ "Certificate validation is disabled, allowing connections to servers with invalid certificates."
  - ❌ "The router appends the service path, making the effective request:"
- **Specificity**: Avoid vague terms.
  - ✅ "Set the timeout to 60000 milliseconds."
  - ❌ "Set an appropriate timeout value."
- **"must" versus "should"**: Use "must" for instructions, requirements, compliance obligations, and technical constraints. For expected outcomes, use active present tense rather than "should". When in doubt, use "must".
  - ✅ "Run all scripts with IT authorization."
  - ✅ "The OData response appears in the file."
  - ❌ "All scripts should be run with IT authorization."
  - ❌ "You should see the OData response."

### UI Actions

- Use "click" for standard button or link interactions.
- Use "right-click...and click" not "right-click...and select".

### Abbreviations and Latin Phrases

- **"i.e."** → "that is,"
- **"e.g."** → "for example,"

## Terminology Standards

### SAP Product Names

| Incorrect | Correct |
|-----------|---------|
| Fiori | SAP Fiori |
| Fiori tools | SAP Fiori tools |
| Fiori Elements / Fiori elements | SAP Fiori elements |
| Fiori UI / Fiori application | SAP Fiori UI / SAP Fiori application |
| BAS / Business Application Studio | SAP Business Application Studio — never abbreviate |
| S/4HANA Cloud | SAP S/4HANA Cloud — always include "SAP" prefix |
| Fiori Launchpad / launchpad / Launchpad | SAP Fiori launchpad — always include "SAP Fiori" prefix; lowercase "launchpad" in prose, capitalised only in headings |
| SAP Help / Help Portal | SAP Help Portal — always use the full name |
| VSCode | VS Code — two words with a space |
| MacOS / Mac OS / macos | macOS — lowercase "mac", uppercase "OS" |

**i18n appDescription**: Use "An SAP Fiori application." (not "A Fiori application.").

### Hyphenation and Compound Words

| Incorrect | Correct | Context |
|-----------|---------|---------|
| backend | back-end | As a modifier: "back-end service" |
| back end | back-end | As a modifier: "back-end service" |
| onpremise | on-premise | Always hyphenated |

**Note:** "back end" (two words, no hyphen) is the noun form. "Back-end" (hyphenated) is the adjective/modifier form.

### Filename Formatting

Filenames in prose and headings must be wrapped in inline code (backticks). When a filename appears standalone (not as part of a longer phrase), add "file" after it. When followed by a noun such as "structure" or "format", insert "file" between the filename and the noun.

- ✅ "Update the `package.json` file."
- ✅ "Add the setting to your `manifest.json` file."
- ✅ "The `xs-security.json` file:"
- ✅ "`package.json` file structure"
- ❌ "Update package.json."
- ❌ "Add the setting to your manifest.json."
- ❌ "`package.json` structure"

This rule applies to all file types: `.json`, `.yaml`, `.yml`, `.xml`, `.md`, `.js`, `.ts`, `.env`, `.properties`, `.pem`, `.crt`, `.har`, and similar.

### Tool and CLI Formatting

- **`npm`**: Always lowercase and in inline code format (backticks) when used in headings or prose. This applies to standalone mentions of the tool name (for example, "`npm` uses semantic versioning") and compound references (for example, "`npm` audit", "`npm` dependencies"). Text already inside a code block or inline code span is unaffected.
  - ✅ "Use `npm` to install dependencies."
  - ✅ "## Understanding `npm` Audit Vulnerabilities"
  - ❌ "Use npm to install dependencies."
- **`devDependencies` / `devDependency`**: Always in camelCase and wrapped in inline code (backticks) when used in prose or headings. Text inside code blocks is unaffected.
  - ✅ "Vulnerabilities in `devDependencies` have minimal runtime impact."
  - ✅ "## Understanding `devDependencies` and Security Scanning"
  - ❌ "Vulnerabilities in devDependencies have minimal runtime impact."
  - ❌ "Vulnerabilities in DevDependencies have minimal runtime impact."
- **"versus"**: Write in full as "versus". Never abbreviate as "vs" or "vs.".
  - ✅ "Runtime versus Development Perspective"
  - ❌ "Runtime vs. Development Perspective"
  - ❌ "Runtime vs Development Perspective"
  - ❌ "Use NPM to install dependencies."

### Inline Code in Prose

Wrap in backticks when the token is being used as code. Do not wrap product names or abbreviations.

- **Wrap in backticks:** environment variable names (`HTTP_PROXY`, `http_proxy`), protocol strings (`http://`, `https://`), file paths (`~/.bashrc`, `ui5.yaml`), CLI flags (`--proxy`), configuration keys (`WebIDEAdditionalData=full_url`), and code variable names.
- **Do not wrap:** product names such as Node.js, Cloud Foundry, or SAP BTP. Do not wrap the abbreviation URL unless the prose is referring specifically to a code variable named URL.
  - ✅ "Set the `HTTP_PROXY` environment variable."
  - ✅ "The proxy URL must use `http://` and not `https://`."
  - ✅ "You have Node.js installed."
  - ❌ "Set the HTTP_PROXY environment variable."
  - ❌ "You have `Node.js` installed."

### Common Corrections

| Incorrect | Correct | Context |
|-----------|---------|---------|
| onpremise | on-premise | Always use hyphenated form |
| around (preposition) | about | "For more information about" |
| via | using | "Connectivity using Cloud Connector" not "via Cloud Connector" |
| back end / backend | back-end | Always hyphenated when used as a modifier |
| HTTP 401/403 | HTTP 401 and HTTP 403 | Spell out "and" for error code pairs |
| V2 and V4 / V2 or V4 | OData V2 and OData V4 / OData V2 or OData V4 | Always prefix each version with "OData" in prose |
| CF | Cloud Foundry | Spell out in prose |
| Github | GitHub | Always capitalize the H |
| i.e. | that is, | Replace Latin abbreviation |
| e.g. | for example, | Replace Latin abbreviation |
| please refer to | For more information, see | Standard link phrasing |

## Technical Accuracy Standards

### Version References

- Specify exact versions when possible instead of "current" or "latest".
- Update year references regularly (current year: 2026).
- Include compatibility information for major version changes.

### URLs and Links

- Use HTTPS instead of HTTP when available.
- Validate SAP documentation links regularly.
- Correct format: `[descriptive text](https://help.sap.com/path)`

### Command Syntax

- Provide complete, runnable commands.
- Include context (working directory, prerequisites).
- Use proper escape sequences and quoting.

### Configuration Examples

- Include all required properties.
- Use realistic example values (not placeholders when possible).
- Validate JSON/YAML syntax.

## Content Quality Standards

### Completeness Checks

- No placeholder text (`[TODO]`, `[TBD]`, `[Add content here]`).
- Complete lists after introductory phrases ("such as:", "including:").
- Working internal links (check anchor references).

### Clarity Requirements

- Explain acronyms on first use.
- Provide context for complex procedures.
- Include expected outcomes for validation steps.

### Examples and Code Snippets

- Substantial code blocks must have explanations.
- Include both positive and error cases where helpful.
- Use realistic data in examples.

## Punctuation and Spacing

- **Slashes as conjunctions**: Do not use `/` to mean "and" or "or" between plain English words or product names in prose. Write "and" or "or" instead. This includes "and/or" — choose the appropriate conjunction.
  - ✅ "Chrome or Edge"
  - ✅ "Key User Extensibility and Customizing"
  - ✅ "`default` and `validate`"
  - ❌ "Chrome/Edge"
  - ❌ "Key User Extensibility/Customizing"
  - ❌ "`default` and/or `validate`"
  - Exception: section-ordering references in style guides where `/` denotes alternative heading names (for example, "Overview/Introduction") are acceptable in that context only. Technical notation in URLs, file paths, and code remains unaffected.

- Single space between sentences.
- No trailing spaces at line ends.
- Use periods after complete sentences in lists.
- Use colons after introductory phrases and for definition-style labels (for example, "Network-level controls: IP allowlists…").
- **Prefer periods over colons between two independent sentences**: When a colon joins what could be two separate sentences, use a period instead.
  - ✅ "Deployment is only supported using `SAMLAssertion`. A destination created with any other authentication type fails."
  - ❌ "Deployment is only supported using `SAMLAssertion`: a destination created with any other authentication type fails."
- Semicolons ending instructional sentences must be replaced with colons.
- **Colons before inline code examples**: When a sentence ends by introducing an inline code value with a phrase such as "in the format", "in the form", or "as follows", add a colon before the code.
  - ✅ "The proxy URL must be in the format: `http://user:password@proxyserver:port`."
  - ❌ "The proxy URL must be in the format `http://user:password@proxyserver:port`."
  - Exception: mid-sentence relative clauses ("…in the format `<generator>:<template>`…") do not take a colon.

## Validation Process

### Pre-Review Checklist

1. **Structure**: Verify heading hierarchy and section order.
2. **Links**: Test all external and internal links.
3. **Code**: Validate syntax in all code blocks.
4. **Consistency**: Check terminology and formatting consistency.
5. **Completeness**: Ensure no placeholder content remains.

### Automated Checks

The `docs-linter` tool is available on the `km-updates` branch only. Do not run these commands on `main`.

```bash
# Validate a file
node docs-linter/src/cli.js validate <file>

# Validate with JSON output
node docs-linter/src/cli.js validate <file> --json

# Auto-fix safe issues
node docs-linter/src/cli.js check <file> --auto-fix-safe
```

## Quality Examples

The following files demonstrate excellent adherence to these standards:

1. `./misc/headless/fioriui/README.md`
   - Comprehensive coverage with clear structure
   - Consistent formatting throughout
   - Technical accuracy and completeness

2. `./sample-fiori-gen-ext/README.md`
   - Well-organized sections with logical flow
   - Good balance of overview and detail
   - Effective use of examples

3. `./misc/destinations/README.md`
   - Extensive technical detail with clarity
   - Excellent troubleshooting section
   - Professional support ticket checklist

## Continuous Improvement

This style guide evolves based on:

- Ongoing KM feedback analysis
- Community contributions
- SAP documentation standard updates

For updates or suggestions, see the latest KM feedback patterns and quality examples analysis.

---
*Based on analysis of 30+ KM feedback commits and 5 quality documentation examples*
*Last updated: June 2026*
