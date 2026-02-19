# Managing npm Dependencies and Addressing Audit Issues in SAP Fiori Projects

## Overview

This guide provides practical approaches to managing npm dependency versions, addressing npm audit vulnerabilities, and applying temporary workarounds when working with SAP Fiori Tools and related SAP development packages. It focuses on understanding the distinction between runtime and development dependencies, tracking package updates, and safely applying interim solutions while waiting for upstream fixes.

When working with SAP-maintained packages such as `@sap/ux-ui5-tooling`, `@sap/cds-dk`, and `@ui5/cli`, you may encounter npm audit warnings related to transitive dependencies. This guide explains why these issues occur, how to track package updates, and when and how to apply temporary fixes.

**Important**: You should work with your organization's compliance and security teams to establish acceptable CVSS (Common Vulnerability Scoring System) thresholds and ensure that any dependency management approach aligns with your security governance policies. Different organizations may have varying requirements for vulnerability severity levels, audit frequency, and remediation timelines. The strategies in this guide should be adapted to meet your specific organizational security standards and compliance requirements. It is also important to recognize that security vulnerabilities are an inherent and ongoing aspect of consuming open-source software. The npm ecosystem evolves continuously, and new vulnerabilities may be disclosed at any time even after remediation of previous findings. As such, dependency risk management should be treated as a continuous process rather than a one-time activity.

> **Note**: The strategies outlined in this guide are general npm approaches freely available on [npmjs.com](https://docs.npmjs.com/) and related documentation. These are not SAP-specific or SAP-supported workflows, but rather industry-standard approaches to npm dependency management that can be applied to SAP Fiori projects.

## Prerequisites

* Basic understanding of npm and package.json structure
* Familiarity with SAP Fiori development tooling
* Version control system (Git recommended) for tracking changes
* Node.js and npm installed

## Understanding Dependencies vs. DevDependencies

### What Are DevDependencies?

DevDependencies are packages required only during development and build time. They are not deployed as part of the application runtime. Examples include:

* Build tools (`@ui5/cli`, `@sap/ux-ui5-tooling`)
* Testing frameworks
* Development servers
* Linters and formatters
* Build tooling like `mbt` (Multi-Target Application Archive Builder)

### Runtime vs. Development Perspective

From a deployment and runtime security perspective, vulnerabilities in devDependencies typically have minimal to no impact because:

* DevDependencies are not included in production builds
* They do not execute in the deployed application environment
* They are only used during local development and CI/CD build processes

However, it is still good practice to keep devDependencies updated to benefit from:

* Latest features and improvements
* Bug fixes
* Compatibility with newer Node.js versions
* Security fixes (especially important in CI/CD environments)

For production deployment strategies that exclude devDependencies, see [Production and CI/CD Installation Approaches](#7-production-and-cicd-installation-approaches).

## Package.json Structure

```json
{
  "dependencies": {
    // Runtime dependencies - deployed with your application
  },
  "devDependencies": {
    // Development-only dependencies - not deployed
    "@sap/ux-ui5-tooling": "1",
    "@ui5/cli": "^4.0.43",
    "@sap/cds-dk": "^9.7.1"
  }
}
```

For more information, see the [npm documentation on specifying dependencies](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file).

## Tracking Package Versions and Updates

### Where to Find Version Information

All npm packages publish their version history on npm's registry. You can track releases and changelogs using the following pattern:

```text
https://www.npmjs.com/package/<package-name>?activeTab=versions
```

#### Common SAP Packages

* [@sap/ux-ui5-tooling versions](https://www.npmjs.com/package/@sap/ux-ui5-tooling?activeTab=versions)
* [@sap/cds-dk versions](https://www.npmjs.com/package/@sap/cds-dk?activeTab=versions)
* [@ui5/cli versions](https://www.npmjs.com/package/@ui5/cli?activeTab=versions)

### Checking for Updates

Use the following npm commands to check for available updates:

```bash
# Check for outdated packages
npm outdated

# View latest version of a specific package
npm view @sap/ux-ui5-tooling version

# View all available versions
npm view @sap/ux-ui5-tooling versions
```

### Upgrading Packages

When upgrading packages, follow these steps:

1. Ensure your project is under source control
2. Check release notes for breaking changes
3. Update package.json with the desired version
4. Clean install dependencies

```bash
# Update a specific package to latest version
npm install @sap/ux-ui5-tooling@latest --save-dev

# Or update package.json manually and reinstall
rm -rf node_modules package-lock.json
npm install
```

For more information, see the [npm update documentation](https://docs.npmjs.com/cli/v9/commands/npm-update).

## Understanding npm Audit Vulnerabilities

### Why Audit Issues Occur

npm audit vulnerabilities often originate from:

#### 1. Transitive Dependencies

Your project depends on package A, which depends on package B, which depends on vulnerable package C. You cannot directly control package C's version without using overrides.

```text
Your Project
└── @sap/ux-ui5-tooling
    └── @sap-ux/preview-middleware
        └── qs (vulnerable version)
```

#### 2. Dependency Version Constraints

Package maintainers often pin or restrict dependency versions to ensure:

* Compatibility across supported Node.js versions
* Compatibility across different operating systems
* Stable behavior in production environments
* Avoiding regressions from untested dependency updates

#### 3. Upstream Update Delays

Even when a fix is available for a vulnerable package, it takes time for:

1. The vulnerable package to release a patched version
2. Intermediate packages to update and test the new version
3. Root packages (like `@sap/ux-ui5-tooling`) to consume and release the update

### When to Be Concerned

Prioritize fixing vulnerabilities based on:

* **Severity**: Critical and High vulnerabilities in production dependencies
* **Exploitability**: Whether the vulnerability is actually exploitable in your use case
* **Dependency Type**: Runtime dependencies vs. devDependencies
* **Network Exposure**: Whether the vulnerable code path is exposed to user input

DevDependencies with vulnerabilities are generally lower priority unless:

* They are used in CI/CD pipelines that handle sensitive data
* They process untrusted input during builds
* Your organization's security policies require it

## Using npm Overrides for Temporary Fixes

### What Are Overrides?

npm overrides allow you to force a specific version of a transitive dependency, overriding what the parent package specifies. This is a temporary solution until the root package releases an update.

### When to Use Overrides

Use overrides when:

* A security vulnerability exists in a transitive dependency
* The root package has not yet released an update
* You need an immediate workaround
* The override version is compatible with the parent package

### Override Syntax

Add the `overrides` field to your package.json:

```json
{
  "name": "my-fiori-project",
  "dependencies": {},
  "devDependencies": {
    "@sap/ux-ui5-tooling": "1",
    "@ui5/cli": "^4.0.43"
  },
  "overrides": {
    "@sap/ux-ui5-tooling": {
      "qs": "6.14.1"
    }
  }
}
```

This forces all instances of `qs` under `@sap/ux-ui5-tooling` to use version `6.14.1`.

### Multiple Overrides

You can specify multiple overrides:

```json
{
  "overrides": {
    "@sap/ux-ui5-tooling": {
      "qs": "6.14.1"
    },
    "@mbt": {
      "tar": "7.5.7"
    }
  }
}
```

### Applying Overrides

After adding overrides to package.json:

```bash
# Remove existing dependencies and lockfile
rm -rf node_modules package-lock.json

# Reinstall with overrides applied
npm install

# Verify the override was applied
npm list qs
npm list tar
```

### Important Considerations

* **Temporary Solution**: Overrides are a workaround, not a permanent fix
* **Remove When Possible**: Remove overrides once the root package updates
* **Test Thoroughly**: Overriding versions may introduce compatibility issues
* **Source Control**: Commit changes so team members are aware
* **Document**: Add comments in package.json explaining why overrides are needed

```json
{
  "overrides": {
    // Temporary fix for qs vulnerability until @sap/ux-ui5-tooling updates
    // See: https://github.com/advisories/GHSA-xxxx-xxxx-xxxx
    // TODO: Remove when @sap/ux-ui5-tooling >= 2.0.0 is released
    "@sap/ux-ui5-tooling": {
      "qs": "6.14.1"
    }
  }
}
```

## Removing npm Dependencies in Favor of Standalone Tools

### Why Remove npm Dependencies?

Some tools are available as standalone binaries and do not need to be installed via npm. Removing them from package.json:

* Reduces dependency tree complexity
* Eliminates transitive dependency conflicts
* Simplifies version management
* Reduces node_modules size

### Example: MBT (Multi-Target Application Archive Builder)

Instead of installing `mbt` as a devDependency:

```json
{
  "devDependencies": {
    "mbt": "^1.2.0",
    "@sap/ux-ui5-tooling": "1",
    "@ui5/cli": "^4.0.43",
    "@sap/cds-dk": "^9.7.1"
  }
}
```

Install it as a standalone CLI tool:

#### Installation

Download and install from the official source:
[MBT Download Page](https://sap.github.io/cloud-mta-build-tool/download/)

#### Verify MBT Installation

```bash
# Verify installation
mbt --version

# Use directly in scripts
mbt build
```

#### Updated package.json

```json
{
  "devDependencies": {
    "@sap/ux-ui5-tooling": "1",
    "@ui5/cli": "^4.0.43",
    "@sap/cds-dk": "^9.7.1"
  }
}
```

### Other Candidates for Standalone Installation

Consider removing these from npm dependencies if available as standalone tools:

* **Cloud Foundry CLI** (`cf`)
* **SAP Cloud SDK CLI**
* **Deployment tools** specific to your environment

## Recommended Approaches

### 1. Regular Maintenance

* Review and update dependencies monthly or quarterly
* Subscribe to security advisories for critical packages
* Keep package.json and package-lock.json in source control

### 2. Before Making Changes

Always ensure your project is under version control:

```bash
# Check git status
git status

# Create a branch for dependency updates
git checkout -b chore/update-dependencies

# Make changes and commit
git add package.json package-lock.json
git commit -m "Update dependencies and apply security fixes"
```

### 3. Testing After Updates

After updating dependencies or applying overrides:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run your build
npm run build

# Run tests if available
npm test

# Start development server
npm start
```

### 4. Document Changes

When applying overrides or making significant dependency changes:

* Add comments in package.json
* Update project README or CHANGELOG
* Document in commit messages
* Share with team members

### 5. Monitor for Upstream Fixes

After applying temporary overrides:

* Regularly check for updates to root packages
* Subscribe to package release notifications
* Test removing overrides when new versions are released

```bash
# Check if new version is available
npm view @sap/ux-ui5-tooling version

# Test removing override
# 1. Remove override from package.json
# 2. Clean install
# 3. Run npm audit
# 4. Test application
```

### 6. Understand Semver

npm uses semantic versioning:

* `^1.2.3` - Compatible with 1.2.3, allows minor and patch updates (1.x.x)
* `~1.2.3` - Compatible with 1.2.3, allows only patch updates (1.2.x)
* `1.2.3` - Exact version only
* `latest` - Always use the latest version (not recommended for production)

### 7. Production and CI/CD Installation Approaches

#### Enterprise-Grade Approach

In production pipelines and deployments, use `npm ci` with the `--omit=dev` flag:

```bash
npm ci --omit=dev
```

**Why this is the recommended approach:**

* **Uses lockfile exactly**: Installs the exact dependency tree from package-lock.json
* **Deterministic**: Produces identical installs across all environments
* **Faster**: Optimized for clean installs, no diff calculations
* **Security-focused**: Excludes devDependencies from production builds
* **Fail-fast**: Errors if package.json and package-lock.json are out of sync

#### Understanding Lockfile Behavior with DevDependencies

**Important Clarification**: You cannot partially generate a lockfile that excludes devDependencies while keeping them in package.json. The package-lock.json file always reflects the **full dependency graph** of your project, including both dependencies and devDependencies.

The `--omit=dev` flag affects **installation only**, not lockfile generation:

* **Lockfile generation** (`npm install`): Always includes all dependencies
* **Production installation** (`npm ci --omit=dev`): Skips installing devDependencies

This design ensures:

* Consistent lockfiles across development and production
* Full dependency tracking in version control
* Selective installation based on environment needs

#### Decision Framework: Choosing the Right Approach

Choose your npm strategy based on your security and deployment goals:

**For Runtime Security** (Recommended for Production):

```bash
npm ci --omit=dev
```

* Excludes devDependencies from deployed artifacts
* Reduces attack surface in production
* Smaller deployment size
* Use when: Deploying to production, building Docker images, creating release artifacts

**For Clean Security Posture** (Development & CI):

```bash
# Remove vulnerable devDependencies from package.json
# OR use overrides to force secure versions
npm ci
```

* Addresses all npm audit findings
* Maintains clean audit reports
* Use when: Security compliance requires clean audits, CI quality gates check audit results

**For Supply Chain Hardening** (All Environments):

```bash
# Pin exact versions in package.json (no ^ or ~)
npm ci
```

* Eliminates version drift
* Prevents supply chain attacks via version bumps
* Maximum reproducibility
* Use when: Regulated environments, high-security requirements, compliance mandates

#### CI/CD Pipeline Examples

**Development Build:**

```bash
# Install all dependencies including devDependencies
npm ci

# Run linting, tests, build
npm run lint
npm test
npm run build
```

**Production Build:**

```bash
# Install only production dependencies
npm ci --omit=dev

# Build production artifacts
npm run build:prod
```

**Docker Multi-Stage Build:**

```dockerfile
# Build stage - includes devDependencies
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - excludes devDependencies
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
CMD ["npm", "start"]
```

#### Verify Production Installation

After installation, verify the approach:

```bash
# Check installed packages (production)
npm list --omit=dev --depth=0

# Check for vulnerabilities in production dependencies only
npm audit --omit=dev

# Verify lockfile integrity
npm ci --dry-run
```

## Common Scenarios

### Scenario 1: qs Vulnerability in @sap/ux-ui5-tooling

#### Identifying the qs Vulnerability

npm audit shows a vulnerability in the `qs` package, introduced via `@sap-ux/preview-middleware`.

#### Solution Approach

Apply an override until the root package is updated:

```json
{
  "overrides": {
    "@sap/ux-ui5-tooling": {
      "qs": "6.14.1"
    }
  }
}
```

Clean and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Monitoring and Cleanup

Monitor for updates:

```bash
npm view @sap/ux-ui5-tooling version
```

Remove override when fixed version is available.

### Scenario 2: tar Vulnerability in mbt

#### Identifying the tar Vulnerability

npm audit shows a vulnerability in `tar`, introduced via `mbt`.

#### Solution Option 1: Remove mbt from npm

Install mbt as a standalone tool (see above) and remove from package.json.

#### Solution Option 2: Apply Override

```json
{
  "overrides": {
    "mbt": {
      "tar": "7.5.7"
    }
  }
}
```

### Scenario 3: axios Denial of Service

#### Identifying the axios Vulnerability

npm audit shows an axios vulnerability in a transitive dependency.

#### Solution Steps

1. Check if the vulnerability affects your use case
2. Verify the package is in devDependencies
3. Check for available updates to root packages
4. If necessary, apply override:

```json
{
  "overrides": {
    "parent-package": {
      "axios": "1.6.0"
    }
  }
}
```

### Scenario 4: Multiple Outdated Packages

#### Identifying Outdated Packages

Multiple packages show available updates.

#### Resolution Strategy

Update incrementally and test:

```bash
# Update one package at a time
npm install @sap/cds-dk@latest --save-dev
npm run build
npm test

# If successful, continue with next package
npm install @ui5/cli@latest --save-dev
npm run build
npm test
```

## Troubleshooting

### Override Not Applied

If the override doesn't seem to work:

```bash
# Ensure clean state
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Verify override
npm list <package-name>
```

### Compatibility Issues After Override

If the overridden version causes issues:

1. Check the parent package's dependency requirements
2. Try a different version within the compatible range
3. Revert the override and wait for official update

```bash
# Revert changes
git checkout package.json package-lock.json
npm install
```

### npm audit Still Shows Vulnerabilities

After applying fixes, npm audit may still show issues:

```bash
# Update npm itself
npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Run audit
npm audit
```

### CI/CD Pipeline Failures

If CI/CD fails after dependency changes:

1. Ensure package-lock.json is committed
2. Use `npm ci` instead of `npm install`
3. Verify Node.js version matches local environment
4. Check for environment-specific issues

## Additional Resources

* [npm Documentation - Dependencies](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file)
* [npm Documentation - Update Command](https://docs.npmjs.com/cli/v9/commands/npm-update)
* [npm Documentation - Overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
* [npm Audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
* [Semantic Versioning](https://semver.org/)
* [SAP Fiori Tools](https://help.sap.com/docs/SAP_FIORI_tools)
* [MBT Download and Installation](https://sap.github.io/cloud-mta-build-tool/download/)

## Summary

Managing npm dependencies in SAP Fiori projects requires a balanced approach:

1. **Understand the context**: Know the difference between runtime and development dependencies
2. **Stay informed**: Track package versions and security advisories
3. **Apply pragmatic solutions**: Use overrides as temporary fixes when necessary
4. **Test thoroughly**: Verify changes don't break functionality
5. **Document decisions**: Help your team understand why changes were made
6. **Plan for cleanup**: Remove temporary fixes once upstream packages are updated
7. **Choose appropriate installation strategy**: Use `npm ci --omit=dev` for production deployments

Remember that devDependencies with vulnerabilities pose minimal runtime risk but should still be addressed through regular maintenance cycles. Always prioritize testing and stability over immediately applying every update.

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
