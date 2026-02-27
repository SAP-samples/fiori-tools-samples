# ESM Migration Plan for docs-linter

> **✅ STATUS: COMPLETED (2026-02-27)**
>
> This migration has been successfully completed. All files converted to ESM.
> See commits: eedab2a, 18df697
>
> This document is retained for historical reference.

---

## Problem Statement (Historical)

The docs-linter system depended on ESM-only packages (remark v15, unified v11, unist-util-visit v5) but was implemented using CommonJS (`require()`). This caused initialization failures when these packages were loaded.

### Current Dependencies (ESM-only)
- `remark@15.0.1` - ESM only as of v14
- `remark-parse@11.0.0` - ESM only
- `remark-stringify@11.0.0` - ESM only
- `unified@11.0.4` - ESM only as of v10
- `unist-util-visit@5.0.0` - ESM only as of v5

### Current Dependencies (CJS-compatible)
- `chalk@4.1.2` - CJS version (v5+ is ESM)
- `commander@11.1.0` - Supports both
- `glob@10.3.10` - Supports both
- `js-yaml@4.1.0` - Supports both

## Solution: Convert to Pure ESM

**Recommendation**: Convert the entire docs-linter to ESM rather than using dynamic imports or bundlers.

### Rationale
1. **Alignment with ecosystem**: Remark/unified ecosystem is fully ESM
2. **Node.js version**: v22.16.0 has excellent ESM support
3. **Future-proof**: ESM is the future of JavaScript modules
4. **Simpler**: No mixed module systems or complex bundling
5. **Better DX**: Native top-level await, cleaner syntax

## Migration Plan

### Phase 1: Package Configuration (5 min)
**File**: `package.json`

Changes:
1. Add `"type": "module"` field
2. Update `"main"` to use `.mjs` or rely on `"type": "module"`
3. Verify all dependencies are ESM-compatible
4. Update scripts if needed

```json
{
  "name": "docs-linter",
  "version": "1.0.0",
  "type": "module",
  "description": "...",
  "main": "src/cli.js",
  "bin": {
    "docs-linter": "./src/cli.js"
  },
  "dependencies": {
    "chalk": "4.1.2",  // Keep CJS version for now
    "commander": "^11.1.0",
    "glob": "^10.3.10",
    "js-yaml": "^4.1.0",
    "remark": "^15.0.1",
    "remark-parse": "^11.0.0",
    "remark-stringify": "^11.0.0",
    "unified": "^11.0.4",
    "unist-util-visit": "^5.0.0"
  }
}
```

### Phase 2: CLI Migration (10 min)
**File**: `src/cli.js`

Changes:
1. Keep shebang: `#!/usr/bin/env node`
2. Convert `require()` → `import`
3. Convert `module.exports` → `export`
4. Remove try-catch ESM compatibility hack

**Before:**
```javascript
const { program } = require('commander');
const chalk = require('chalk');
const DocsLinter = require('./linter');
```

**After:**
```javascript
import { program } from 'commander';
import chalk from 'chalk';
import DocsLinter from './linter.js';  // Note: .js extension required
```

**Critical**: Must add `.js` extensions to all local imports in ESM!

### Phase 3: Core Linter Migration (15 min)
**File**: `src/linter.js`

Changes:
1. Convert all `require()` → `import`
2. Convert `module.exports` → `export default`
3. Add `.js` extensions to local imports
4. Update fs methods if needed (fs/promises preferred in ESM)

**Before:**
```javascript
const fs = require('fs');
const { unified } = require('unified');
const remarkParse = require('remark-parse');
const { visit } = require('unist-util-visit');
const StructuralRules = require('./rules/structural');
```

**After:**
```javascript
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import StructuralRules from './rules/structural.js';
import FormattingRules from './rules/formatting.js';
import ContentRules from './rules/content.js';
import TechnicalRules from './rules/technical.js';

// ... class implementation ...

export default DocsLinter;
```

### Phase 4: Rules Migration (20 min)
**Files**:
- `src/rules/structural.js`
- `src/rules/formatting.js`
- `src/rules/content.js`
- `src/rules/technical.js`

Changes for each:
1. Convert `require()` → `import`
2. Convert `module.exports` → `export default`
3. Add `.js` extensions if they import other local modules

**Pattern:**
```javascript
// Top of file
import { visit } from 'unist-util-visit';

// Bottom of file - change from:
module.exports = StructuralRules;

// To:
export default StructuralRules;
```

### Phase 5: Testing & Validation (15 min)

1. **Syntax check**:
   ```bash
   node --check src/cli.js
   node --check src/linter.js
   node --check src/rules/*.js
   ```

2. **Basic execution**:
   ```bash
   node src/cli.js --help
   node src/cli.js check ../README.md
   ```

3. **NPM scripts**:
   ```bash
   npm run check -- ../README.md
   npm run validate -- ../README.md
   ```

4. **Integration test** (if exists):
   Run against a known markdown file with issues

5. **Hook compatibility**:
   Test pre-commit/pre-push hook integration

### Phase 6: Documentation Update (5 min)

**File**: `docs-linter/README.md`

Update lines 84-86:
```markdown
### ✅ Implemented
- Complete rule implementation (structural, formatting, content, technical)
- CLI with check, fix, and validate commands
- Training data integration
- Auto-fix capabilities with safety flags
- Quality scoring system
- JSON output support
- **Full ESM compatibility** ✨

### 🔮 Planned
- Pre-commit hook integration
- CI/CD pipeline integration
- Watch mode for live feedback
- VS Code extension
- GitHub Action
- Custom rule configuration
```

### Phase 7: Cleanup (5 min)

**File**: `src/cli.js`

Remove graceful degradation code (lines 11-24):
```javascript
// REMOVE THIS BLOCK:
let linter;
let linterAvailable = false;

try {
  const DocsLinter = require('./linter');
  linter = new DocsLinter();
  linterAvailable = true;
} catch (error) {
  console.log(chalk.yellow('[docs-linter] Linter unavailable - ESM compatibility issue'));
  console.log(chalk.gray('  Use /km-review skill for AI-powered review instead'));
  linterAvailable = false;
}
```

Remove all `linterAvailable` checks in commands.

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1. Package config | 5 min | 5 min |
| 2. CLI migration | 10 min | 15 min |
| 3. Linter migration | 15 min | 30 min |
| 4. Rules migration | 20 min | 50 min |
| 5. Testing | 15 min | 65 min |
| 6. Documentation | 5 min | 70 min |
| 7. Cleanup | 5 min | 75 min |

**Total: ~75 minutes** (1 hour 15 minutes)

## Risks & Mitigations

### Risk 1: Breaking existing integrations
**Mitigation**:
- Test pre-commit hooks after migration
- Verify npm scripts still work
- Check any external tools that import docs-linter

### Risk 2: Node.js version compatibility
**Mitigation**:
- Current: v22.16.0 (excellent ESM support)
- Minimum required: v14+ (when ESM stabilized)
- Add engines field to package.json: `"engines": { "node": ">=14.13.0" }`

### Risk 3: __dirname not available in ESM
**Mitigation**:
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Risk 4: JSON imports
**Mitigation**:
- Training data JSON files loaded with `fs.readFileSync()` - no changes needed
- If needed, use import assertions: `import data from './file.json' assert { type: 'json' };`

## Rollback Plan

If migration fails:
1. Revert via git: `git checkout src/`
2. Revert package.json: `git checkout package.json`
3. Re-install dependencies: `npm install`
4. Graceful degradation is still in place on main branch

## Success Criteria

- [ ] All CLI commands work without ESM errors
- [ ] Can successfully parse markdown with remark
- [ ] All rule categories execute properly
- [ ] npm scripts function correctly
- [ ] Pre-commit hooks run successfully
- [ ] No regression in linting accuracy
- [ ] README updated with new status
- [ ] Graceful degradation code removed

## Alternative Approaches (Not Recommended)

### Alternative 1: Dynamic Import
Use `import()` function in CommonJS:
```javascript
const DocsLinter = await import('./linter.js');
```
**Why not**: Requires async wrappers everywhere, messy code

### Alternative 2: Bundler (esbuild/webpack)
Bundle ESM dependencies into CommonJS:
**Why not**: Adds build complexity, obscures debugging, maintenance burden

### Alternative 3: Downgrade Dependencies
Use older CJS versions of remark:
**Why not**: Lose features, security updates, eventually unsustainable

## Post-Migration Opportunities

Once ESM is working:
1. **Upgrade chalk to v5**: Better colors and styling
2. **Use fs/promises**: Cleaner async file operations
3. **Top-level await**: Simplify async initialization
4. **Native JSON imports**: Cleaner training data loading

## References

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [Remark ESM Migration Guide](https://github.com/remarkjs/remark/releases/tag/14.0.0)
- [Unified ESM Migration](https://github.com/unifiedjs/unified/releases/tag/10.0.0)
- [Pure ESM Package Guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
