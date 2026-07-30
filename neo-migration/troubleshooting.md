# Troubleshooting

## SAP Fiori Migration Tool Does Not Detect Your Application

If SAP Fiori Migration tool does not detect your application, ensure your exported project contains a `webapp` folder. If this folder is missing, generate a `webapp` folder inside the root of your project, move all your UI code but exclude application specific code, for example `neo-app.json`, `pom.xml`, and `.che`.  

If you are also missing a `manifest.json` file inside of your `webapp` folder, For more information, see [Creating a Descriptor File](https://sapui5.hana.ondemand.com/sdk/#/topic/3a9babace121497abea8f0ea66e156d9.html) in the UI5 documentation.

## Application Fails to Load When Running `npm run start`

When running `npm run start` or local preview, the app fails to load, which throws the following exception in the console:

```text
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {  "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "Cannot read properties of undefined (reading 'getResourceBundle')\nTypeError: Cannot read properties of undefined (reading 'getResourceBundle')\n    at new constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:11:276)\n    at f.init (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:5:337)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:952\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:1036)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:623:577)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap/ui/core/library-preload.js:1015:189)\n    at new f (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:573:558)\n    at A (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:472)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:1279\n    at r (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:621:113)"}
```

To resolve this issue, the `manifest.json` file and the `Component.js` IDs must be synced.

Open the `Component.js` file and look for the following code:

```html
t.extend("ns.manageproductsneo.Component",{metadata:{manifest:"json"}
```

Open the `manifest.json` file and refer to the ID:

```json
    "_version": "1.12.0",
    "sap.app": {
        "id": "manageproductsneo",
```

When running the start command, the app loads with the `test/flpSandbox.html` file, the ID on line 49 and 69 must be updated to reflect the `Component.js` ID:

```text
Line 49: additionalInformation: "SAPUI5.Component=ns.manageproductsneo",
Line 69: data-sap-ui-resourceroots='{"ns.manageproductsneo": "../"}'
```

## An Error Occurred in the `manifest.json` File When Starting the Application

In this sample app, there was an issue with the `manifest.json` file. When the application was started up using `npm run start`, it threw the following error:

```text
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {    "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "invalid input\nTypeError: invalid input\n    at p.href (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:17025)\n    at new U (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:872)\n    at constructor._loadI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1147:113)\n    at constructor._processI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1146:339)\n    at new constructor (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1145:694)\n    at e._applyManifest (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:669:468)\n    at https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:654:456"}
```

To resolve this issue, the `i18n` section in the `manifest.json` file was changed from:

```json
"i18n": {
            "bundleUrl": "i18n/i18n.properties",
            "supportedLocales": [
                ""
            ],
            "fallbackLocale": ""
        },
```

To the following:

```json
"i18n": "i18n/i18n.properties",
```

If the issue persists, try bumping the `"minUI5Version": "1.108.2"` in your `manifest.json` file to a later version. For more information about supported SAPUI5 versions, see [SAPUI5 Versions Maintenance Status](https://sapui5.hana.ondemand.com/versionoverview.html). Another option, when you want to only validate locally, is to update the `ui5.yaml` file with a specific SAPUI5 version, for example to specify `1.109.0`:

```yaml
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com
          version: 1.109.0
```

## Application Fails to Load with HTTP 403 After Deployment

The application is unable to load due to network errors relating to HTTP 403 when deployed to Cloud Foundry. Confirm this by reviewing the logs for your deployed application in SAP BTP cockpit under HTML5 Applications and selecting the logs icon next to your application.

The root cause is an issue with the scope applied in your `xs-app.json` file. If the logged-in user does not have the appropriate permissions, then add their ID to the role collection. In some instances, you must delete your session cookies or try using incognito mode to validate the new security roles are applied correctly.

## Static Code Analysis Throws `JS_PARSING_ERROR` in CI/CD Pipeline

During your CI/CD pipeline job, the static code analysis throws a linting issue `Quality issue: JS_PARSING_ERROR:Very High!` when processing the `locate-reuse-libs.js` file.

This assumes your `pom.xml` file contains the following plugin:

```xml
<groupId>com.sap.ca</groupId>
<artifactId>analysis-plugin</artifactId>
<version>${sap.analysis.version}</version>
```

**Current configuration:**

```xml
<sap.analysis.version>1.54.8</sap.analysis.version>
```

**Proposed configuration:**

```xml
<sap.analysis.version>2.0.4</sap.analysis.version>
```

**Version update rationale:**

- Major version increment from 1.x to 2.x
- Potential breaking changes in static analysis rules
- Enhanced parsing capabilities
- Improved error detection mechanisms

## HTTP 404 Error: Application Not Loading After Deployment

The HTML5 application is deployed to Cloud Foundry, but the application is not loading. After reviewing the network console logs in your browser, an HTTP 404 Not Found error is returned:

For more information about how to resolve this issue, see [SAP Support Portal](https://ga.support.sap.com/dtp/viewer/index.html#/tree/3046/actions/45995:45996:50742:51205:51192:51196:52513).

The issue is related to an AJAX API call using an absolute path instead of a relative path. Each application deployed to Cloud Foundry is given a unique GUID, which is how multiple apps can be deployed to the same subaccount. The absolute path is not able to resolve the GUID and therefore the application fails to load.

## Features Not Working in SAP Business Application Studio Local Preview

The deployed Cloud Foundry HTML5 application renders as expected, but some features do not work as expected when running in SAP Business Application Studio in local preview mode.

This assumes your application uses the `fiori-tools-proxy` middleware to proxy API calls to back-end systems using SAP BTP destinations and you have started the application using `npm run start`.

To determine the root cause of your issue, review the Network tab in your browser's Developer Console. Connectivity issues can manifest as an HTTP 404 or CORS error.

### Review the `xs-app.json` File

```json
{
  "welcomeFile": "/index.html",
  "authenticationMethod": "route",
  "routes": [
    {

      "source": "^/scim/(.*)$",
      "target": "$1",
      "destination": "API_ENDPOINT",
      "authenticationType": "none",
      "csrfProtection": false
    },
    {
      "source": "^/sap/(.*)$",
      "target": "/sap/$1",
      "destination": "s4hc_onpremise",
      "authenticationType": "xsuaa",
      "csrfProtection": false
    },    
    ...
```

The source path is `^/scim/(.*)$` which is a regular expression used to break up the URL path into string groups. Any API call starting with `/scim` is proxied to the `API_ENDPOINT` destination using the `$1` target path. In this instance, the `$1` target path reflects the URL segment after `/scim/`.

For example, an API call intercepted on Cloud Foundry `https://mysubdomain.launchpad.cfapps.eu10.hana.ondemand.com/a69add83-6355-4ba5-97d8-ad6fc0c912b7.mycommonhtml5app-0.0.1/scim/v2?sap-client=500` is proxied to the `API_ENDPOINT` SAP BTP destination as `https://internal.resource/v2?sap-client=500` where `scim` is removed from the API call.

This approach is typically used where an HTML5 application must support different back-end systems that may use the same path structure.

For the second route definition, `^/sap/(.*)$`, an API call intercepted at `https://mysubdomain.launchpad.cfapps.eu10.hana.ondemand.com/a69add83-6355-4ba5-97d8-ad6fc0c912b7.mycommonhtml5app-0.0.1/sap/opu/odata/sap/FIN_ACCOUNTING_IMPACT_SRV/?sap-client=500` is proxied to the `s4hc_onpremise` SAP BTP destination as `https://some.intneral.resource/sap/opu/odata/sap/FIN_ACCOUNTING_IMPACT_SRV/?sap-client=500` where `sap` is retained.

### Review the `ui5.yaml` Configuration

The `ui5.yaml` file is configured with two back-end destinations, one for `API_ENDPOINT` and another for `s4hc_onpremise`.

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: my.fiori.app
type: application
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ignoreCertErrors: false # If set to true, certificate errors are ignored, for example, self-signed certificates are accepted
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com
        backend:
          - path: /scim
            pathReplace: /
            url: https://some.external.resource/scim/v2
            destination: API_ENDPOINT
          - path: /sap
            url: http://s4hconpremise:44320
            destination: s4hc_onpremise
    - name: fiori-tools-appreload
      afterMiddleware: compression
      configuration:
        port: 35729
        path: webapp
        delay: 300
    - name: fiori-tools-preview
      afterMiddleware: fiori-tools-appreload
      configuration:
        flp:
          theme: sap_horizon
```

After reviewing the `xs-app.json` file, the `/scim/(.*)` source path is mapped to the `API_ENDPOINT` destination and expects the `/scim` to be stripped out of the proxied URL.

The root cause of the issue is that the local proxy makes the API call to `https://some.external.resource/scim/v2` which results in an HTTP 404 Not Found error because the back-end system is expecting the call to be made to `https://some.external.resource/`.

The solution is to update the `ui5.yaml` file to include the `pathReplace` property to strip out the `/scim` from the proxied URL.

```yaml
          - path: /scim
            pathReplace: /
            url: https://some.external.resource/scim/v2
            destination: API_ENDPOINT
```

Now, any request to `https://localhost:8080/scim/v2` is correctly proxied to the SAP BTP destination as `https://API_ENDPOINT.dest/v2` with `scim` removed.

Similarly, any request to `https://localhost:8080/sap` is correctly proxied to the SAP BTP destination as `https://s4hc_onpremise.dest/sap` with `sap` retained.

## HTTP 404 Error When Rendering Deployed SAP Fiori Application

When rendering an SAP Fiori application after being deployed to Cloud Foundry, the application fails to load. Using Developer Tools network console, the API call returns an HTTP 404 Not Found.

> **Note:** In some instances it can return an HTTP 403 response as well.

![Issue 9 - 404 Error](Issue9-404Error.png?raw=true "HTTP 404 Not Found error in deployed application")

This issue is typically caused by custom code that makes AJAX calls using absolute URL paths (paths starting with `/`) instead of relative paths. Common scenarios include:

- Custom controller extensions making direct AJAX calls to back-end services
- Custom fragments or dialogs that fetch data programmatically
- JavaScript code using `jQuery.ajax()`, `fetch()`, or similar methods with hardcoded absolute paths
- Extension points where developers have added custom API calls

**Important**: This issue assumes the OData service call does not reference the `dataSources` section in the `manifest.json` file. If your service is properly configured in `dataSources`, the framework handles URL resolution automatically. This problem only occurs when developers bypass the standard SAPUI5 data binding mechanisms and make direct HTTP calls in custom code.

For more information, see [SAP Support Portal](https://ga.support.sap.com/index.html#/tree/3046/actions/45995:45996:50742:51205:51192:51196:52513).

### Solution

Based on the sample code above, change line 16 from `/sap/v2/product/MY_PRODUCT` to `sap/v2/product/MY_PRODUCT` where the leading slash is removed.

This change assumes your `xs-app.json` file is configured as follows:

```json
{
  "source": "^/sap/(.*)$",
  "target": "/sap/$1",
  "destination": "MyDestination",
  "csrfProtection": false,
  "authenticationType": "none"
}
```

### Understanding the Issue

The 404 requests use the absolute URL path, for example:

```text
https://my-subaccount.launchpad.cfapps.eu10.hana.ondemand.com/my_fioriapp-1.0.0/sap/v2/product/MY_PRODUCT/$metadata?sap-value-list=none&sap-language=DE
```

However, valid HTTP calls are sent to `https://my-subaccount.launchpad.cfapps.eu10.hana.ondemand.com/my_fioriapp-1.0.0/~230421170029+0000~/` which is the actual base URL of your application.

Removing the leading slash now sends the AJAX call to the relative path of where the app is hosted, for example:

```text
https://my-subaccount.launchpad.cfapps.eu10.hana.ondemand.com/my_fioriapp-1.0.0/~230421170029+0000~/sap/v2/product/MY_PRODUCT/$metadata?sap-value-list=none&sap-language=DE
```

### Additional Note

If your `manifest.json` file is configured with a datasource, for example:

```json
"dataSources": {
  "mainService": {
    "uri": "/sap/my_service/",
    "type": "OData",
    "settings": {
      "odataVersion": "4.0"
    }
  }
}
```

There are additional changes that allow you to use the `manifest.json` file to find the base URL for your application. For more information, see [SAP Community](https://community.sap.com/t5/technology-q-a/calling-service-using-ajax-in-fiori-elements-extension-doesn-t-work-in/qaq-p/12398015) for a detailed summary of the required changes or the [SAPUI5](https://ui5.sap.com/#/api/sap.ui.core.Manifest) documentation.

### Reporting Issues

If you still face issues, open a support incident with SAP. When doing so, provide a full network trace (`.har` file) with all the requests in the scenario after it was reproduced.

For more information about how to extract the trace, see [How to capture an HTTP trace using Google Chrome or MS Edge (Chromium)](https://launchpad.support.sap.com/#/notes/1990706).

## Application Fails to Load in SAP Build Work Zone Due to Outdated `minUI5Version`

After migrating your application, the `manifest.json` file contains an outdated `"minUI5Version"` value, for example:

```json
"sap.ui5": {
    "dependencies": {
        "minUI5Version": "1.84.7"
    }
}
```

The application runs correctly in local preview but fails to load when deployed to SAP Build Work Zone (formerly SAP Fiori Launchpad). This is because your local preview fetches the SAPUI5 version configured in your `ui5.yaml` file, whereas SAP Build Work Zone runs its own SAPUI5 version. When the version running in SAP Build Work Zone is lower than the `minUI5Version` declared in your `manifest.json` file, the framework rejects the component and the application fails to load.

### Replicating the Issue Locally

To identify the SAPUI5 version your SAP Build Work Zone instance is running:

1. Open your deployed application in Google Chrome.
2. Open Developer Tools by pressing `F12`.
3. Select the **Console** tab.
4. Enter the following and press `Enter`:

```text
sap.ui.version
```

The version returned is the SAPUI5 version running in SAP Build Work Zone. Compare this against the `"minUI5Version"` declared in your `manifest.json` file. If the SAP Build Work Zone version is lower, the application does not load.

### Solution

Update the `"minUI5Version"` in your `manifest.json` file to a version that is equal to or lower than the SAPUI5 version running in SAP Build Work Zone. You must also align the `_version` property at the root of the `manifest.json` file to the manifest schema version that corresponds to your target SAPUI5 version.

To identify supported and maintained SAPUI5 versions and their corresponding manifest schema versions, see the following resources:

- [SAPUI5 Versions Maintenance Status](https://ui5.sap.com/versionoverview.html)
- [UI5 Manifest Version Mapping](https://github.com/UI5/manifest/blob/main/mapping.json)

The manifest version mapping defines which manifest `_version` corresponds to each SAPUI5 version. For example, SAPUI5 version `1.140` maps to manifest `_version` `1.78.0`.

Update your `manifest.json` file as follows. Ensure both `_version` and `minUI5Version` are aligned:

```json
{
    "_version": "1.78.0",
    "sap.app": {
        ...
    },
    "sap.ui5": {
        "dependencies": {
            "minUI5Version": "1.140.0"
        }
    }
}
```

Choose a version that is within the maintenance window and compatible with the SAPUI5 version deployed to your SAP Build Work Zone instance.

## XSUAA Rejects `xsappname` When CF Org or Space Name Contains Whitespace

The generated `mta.yaml` sets `xsappname` using deploy-time MTA variables:

```yaml
xsappname: <app-name>-${org}-${space}
```

Cloud Foundry substitutes `${org}` and `${space}` at `cf deploy` time. If your Cloud Foundry org or space name contains whitespace, XSUAA rejects the `xsappname` — this is an SAP BTP platform constraint, not a tooling issue. See [KBA 3666332](https://me.sap.com/notes/3666332).

**Fix options:**

- Rename your CF org or space to remove whitespace. See [KBA 3115060](https://me.sap.com/notes/3115060).
- Or manually replace `${org}-${space}` with `${space-guid}` in the generated `mta.yaml`:

  ```yaml
  xsappname: <app-name>-${space-guid}
  ```

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../LICENSES/Apache-2.0.txt) file.
