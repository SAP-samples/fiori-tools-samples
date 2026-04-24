# Deployment

This page covers how to deploy your SAP Fiori app to an on-premise ABAP repository using the SAP BTP destination. Before starting, confirm that [connectivity works](./connectivity.md).

Table of Contents

- [Prerequisites](#prerequisites)
- [Debugging Deployment Errors (HTTP 401 and HTTP 403)](#debugging-deployment-errors-http-401-and-http-403)
- [Connection Test](#connection-test)
  - [What the Test Validates](#what-the-test-validates)
- [Unknown File Type During Upload](#unknown-file-type-during-upload)
- [Known Issues](#known-issues)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before deploying, confirm the following on your back-end system:

- `/UI5/ABAP_REPOSITORY_SRV` is activated.
- You have the required `S_DEVELOP` authorizations.

For more information, see [Using an OData Service to Load Data to the SAPUI5 ABAP Repository](https://ui5.sap.com/#/topic/a883327a82ef4cc792f3c1e7b7a48de8).

---

## Debugging Deployment Errors (HTTP 401 and HTTP 403)

- Review the ABAP transaction logs `/IWFND/ERROR_LOG` and `/IWFND/GW_CLIENT`. These logs indicate missing authorizations and other local issues.
- For more information, see [Deployment to ABAP On-Premise System](https://ga.support.sap.com/index.html#/tree/3046/actions/45995:45996:50742:46000).

To capture verbose deployment debug output:

```bash
# Mac / Linux
DEBUG=* npm run deploy

# Windows (PowerShell)
set DEBUG=* && npm run deploy
```

---

## Connection Test

Run this test to confirm the deployment endpoint is reachable before running `npm run deploy`. This is a connectivity check only — it issues a single HTTP GET request against `ABAP_REPOSITORY_SRV`.

The `bsp-name` placeholder in the URL identifies the target BSP application. Its value does not affect connectivity validation — substitute a known application name if one is available, or leave it as `bsp-name`. An HTTP 404 response when using the placeholder is expected and confirms that the endpoint is reachable but no application named `bsp-name` is deployed on the target system. Any HTTP 2xx or 4xx response indicates a live connection; HTTP 5xx or no response indicates a connectivity or configuration issue.

### Validating on SAP Business Application Studio

Run the following from an SAP Business Application Studio terminal:

```bash
# Replace <destination-name> and bsp-name before executing
# If authentication is required, add: -u "username:password"
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/UI5/ABAP_REPOSITORY_SRV/Repositories(%27bsp-name%27)?saml2=disabled" > curl-abap-srv-output.txt 2>&1
```

### Validating on Your Local Network

Run the following from a local terminal, replacing `<internal-host>`, `<internal-port>`, and `bsp-name` with your system values:

```bash
# Replace <internal-host>, <internal-port>, and bsp-name before executing
# If authentication is required, add: -u "username:password"
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<internal-host>:<internal-port>/sap/opu/odata/UI5/ABAP_REPOSITORY_SRV/Repositories(%27bsp-name%27)" > curl-abap-srv-output.txt 2>&1
```

On Windows, use the following PowerShell command instead:

```powershell
# Replace <internal-host>, <internal-port>, and bsp-name before executing
# If authentication is required, add: -Credential (Get-Credential) or -Headers @{ "Authorization" = "Basic <base64(username:password)>" }
Invoke-WebRequest -Uri "https://<internal-host>:<internal-port>/sap/opu/odata/UI5/ABAP_REPOSITORY_SRV/Repositories('%27bsp-name%27)" `
  -Headers @{ "X-CSRF-Token" = "Fetch" } `
  -MaximumRedirection 10 `
  -OutFile curl-abap-srv-output.txt `
  -Verbose *>&1 | Out-File curl-abap-srv-output.txt
```

> **Note:** The `?saml2=disabled` parameter is not required when accessing the system locally. Add it only when testing through an SAP BTP destination to prevent browser-based SAML redirects in service-to-service flows.
>
> You can also paste the URL directly into a browser in private or incognito mode to perform a quick reachability check. However, the browser bypasses local proxy and firewall settings in some configurations, which may mask connectivity issues that `curl` or PowerShell would surface.

Review `curl-abap-srv-output.txt` for authentication, authorization, or connectivity errors.

### What the Test Validates

#### Destination resolution

`https://<destination-name>.dest` verifies that:

- The SAP BTP destination exists.
- The destination is bound to your application (if applicable).
- Connectivity using the Cloud Connector (for on-premise systems) works.

#### Authentication flow

Confirms that the configured authentication method (such as BasicAuthentication, SAML Assertion, or OAuth2) works.

If authentication fails, you typically see:

- `401 Unauthorized`: Invalid credentials or trust not established.
- `403 Forbidden`: Authenticated but missing back-end authorization.

#### Back-end reachability

`/sap/opu/odata/UI5/ABAP_REPOSITORY_SRV` validates:

- SAP Gateway is active.
- The OData service is registered and active (`/IWFND/MAINT_SERVICE`).
- The ICF node is active (`/sap/opu/odata`).

#### CSRF token handling

`-H "X-CSRF-Token: Fetch"` forces the back end to authenticate the request, issue a valid CSRF token, and return any required session cookies.

---

## Unknown File Type During Upload

**Error:** "Not uploaded as binary/text type is unknown: Adjust content of files."

**Root cause:** The ABAP UI5 repository validates file extensions during upload. Files with extensions not listed in `.Ui5RepositoryTextFiles` or `.Ui5RepositoryBinaryFiles` are rejected.

**Solution:** Add the unknown extensions to the appropriate configuration file in your project.

1. Navigate to the `webapp` folder of your project:

   ```
   <projectRoot>/webapp/
   ```

2. Create the configuration files if they do not already exist:

   - `.Ui5RepositoryTextFiles`: for text-based file types
   - `.Ui5RepositoryBinaryFiles`: for binary asset types

3. Add the file patterns for the unknown extensions:

   `.Ui5RepositoryTextFiles`:

   ```
   **/*.ts
   **/*.yaml
   **/*.jsonc
   ```

   `.Ui5RepositoryBinaryFiles`:

   ```
   **/*.eot
   **/*.woff
   **/*.ttf
   ```

4. Rebuild and redeploy the application:

   ```bash
   npm run deploy
   ```

   The build packages both configuration files into `archive.zip`, which allows the ABAP back end to classify the previously unknown file types. The deployment then proceeds without the error.

For more information, see [Using an OData Service to Load Data to the SAPUI5 ABAP Repository](https://ui5.sap.com/#/topic/a883327a82ef4cc792f3c1e7b7a48de8).

---

## Known Issues

- [SAP Note 3378435 - Response headers too big in /UI5/UI5_REPOSITORY_LOAD](https://me.sap.com/notes/0003378435)

---

## Additional Resources

- [Build and Deploy your SAPUI5 Application Using SAP Business Application Studio to ABAP Repository (on-premise system)](https://community.sap.com/t5/technology-blog-posts-by-members/build-and-deploy-your-sapui5-application-using-sap-business-application/ba-p/13559538)
- [Support Checklist](./support-checklist.md) — what to attach when raising a support ticket

---

**Previous:** [Connectivity](./connectivity.md) — configure and validate your Cloud Connector and BTP destination.

**Next:** [Principal Propagation](./principal-propagation.md) — configure end-user identity forwarding to the back end.
