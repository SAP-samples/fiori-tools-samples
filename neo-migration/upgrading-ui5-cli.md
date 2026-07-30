# Upgrading `@ui5/cli` to v4

After migrating your application, update `@ui5/cli` to v4 to benefit from the latest toolchain improvements. For more information, see [Migrate to v4](https://ui5.github.io/cli/v4/updates/migrate-v4/).

## Prerequisites

- Node.js v20.11.0 or higher, or v22.0.0 or higher. Node.js v21 is not supported.
- `npm` v8 or higher.

## Update `@ui5/cli`

Update `@ui5/cli` in your `package.json` file to v4:

```bash
npm install --save-dev @ui5/cli@^4
```

## Breaking Changes

If your project uses Specification Version 2.x or 3.x, no changes are required — projects using these versions are fully compatible with `@ui5/cli` v4.

If your project uses Specification Version 4.0 or higher, review the following breaking changes.

**Remove `usePredefineCalls`**

The `usePredefineCalls` option has been removed. Bundling now always uses `sap.ui.predefine` calls. Remove this property from your `ui5.yaml` file if present:

```yaml
builder:
    bundles:
        - bundleDefinition:
            sections:
                - mode: require
                  resolve: true
                  sort: true
```

**Async require sections**

The `async` option for `require` bundle sections now defaults to `true`. This changes the loading behaviour from `sap.ui.requireSync` to `sap.ui.require`. If your application requires synchronous loading, set `async: false` explicitly:

```yaml
builder:
    bundles:
        - bundleDefinition:
            sections:
                - mode: require
                  async: false
```

For more information, see [Migrate to v4](https://ui5.github.io/cli/v4/updates/migrate-v4/).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../LICENSES/Apache-2.0.txt) file.
