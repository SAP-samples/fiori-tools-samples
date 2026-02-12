# Migrating HTML5 Applications from the SAP BTP, Neo to Cloud Foundry

Referenced guide: <https://help.sap.com/docs/HTML5_APPLICATIONS/b98f42a4d2cd40a9a3095e9f0492b465/b1763fd06421457b9970a3555020e750.html>

Learn how to migrate custom HTML5 applications on SAP BTP from the Neo to the Cloud Foundry environment.

## Prerequisites

* You'll need an SAP Business Technology Platform (SAP BTP) account
* You are subscribed to SAP Business Application Studio, follow this [tutorial](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html) for more information
* You are subscribed to the SAP Launchpad Service, follow this [tutorial](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html) for more information
* If the referenced services are not available in Service Marketplace, please select Entitlements from the root of your subaccount, select Configure Entitlements, locate the required service, create it, save it and then return to the Service Marketplace to add the required service to your subaccount.

## Create SAP Fiori Dev Space

From your SAP BTP cockpit, select Instances and Subscriptions, select SAP Business Application Studio which will open a new tab into your dev space manager. Generate a Full Stack Cloud Application dev space with SAP HANA Tools enabled.

## Migrate Security and Destinations

Generate new migration folder to contain all your existing Neo settings:

```bash
mkdir -p /home/user/projects/neo/
```

Upload `*.mtar` | `*.zip`, `mta.yaml` to the migration folder

Create base configs, required to migrate the destinations from your old Neo subaccount:

```bash
touch xs-security.json mtad.yaml config.json
```

Sample configurations for each respective file:

mtad.yaml

```yaml
_schema-version: "3.1"
ID: migrationcf
description: Migrate services
version: 1.0.0
resources:
- name: my_destination_service
  type: org.cloudfoundry.managed-service
  parameters:
    service-plan: lite
    service: destination
    path: config.json
- name: my_connectivity_service
  type: org.cloudfoundry.managed-service
  parameters:
    service-plan: lite
    service: connectivity
```

config.json

```json
{
    "init_data": {
      "subaccount": {
        "existing_destinations_policy": "update",
        "destinations": [
        {
          "Name": "northwind",
          "WebIDEEnabled": "true",
          "WebIDEUsage": "odata_gen",
          "HTML5.DynamicDestination": "true",
          "Authentication": "NoAuthentication",
          "Description": "Destination to internet facing host",
          "ProxyType": "Internet",
          "Type": "HTTP",
          "URL": "https://services.odata.org"
        }
      ]
    }
  }
}
```

xs-security.json

```json
{
    "xsappname": "migrationcf",
    "tenant-mode": "dedicated",
    "description": "Security profile of called application",
    "scopes":[
      {
        "name": "$XSAPPNAME.globalrole",
        "description": "Migrated role"
      }
    ],
    "role-templates": [
      {
        "name": "globalrole",
        "description": "Migrated Role Template",
        "scope-references": [
        "$XSAPPNAME.globalrole"
        ]
      }
    ],
    "role-collections": [
      {
        "name": "GobalRole",
        "description": "Global from migrated neo",
        "role-template-references": [
          "$XSAPPNAME.globalrole"
        ]
      }
    ]
}
```

Please note, this destination is creating destinations at `subaccount` level, all applications deployed to this subaccount will have access to these destinations. If however, you want to generate instance based destinations where the destinations are encapsulated as part of the deployed application then refer this [sample configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/).

Security configuration is configured using a global role collection that can be consumed by apps using the mta ID and the scoped name i.e. `migrationcf.globalrole`. In this instance, its only for demo purposes and the respective applications will manage their own security concerns, creating their own roles/templates in the `xs-security.json` attached to the project.

For more information around Security Administration refer to <https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/1ff47b2d980e43a6b2ce294352333708.html>

Ensure you are logged into CF target system where the new settings need to be applied:

```bash
cf login -a <api-endpoint -o <organisation> -s <space>
```

or else from BAS, run `View -> Command Palette -> Login to Cloud Foundry`

Deploy the new services to your new subaccount target system:

```bash
cf deploy
```

Your subaccount is now configured with destinations at subaccount level.

You have two options of migrating your Neo UI application as each produces a different folder structure:

* Option 1. [Migrate Neo application for a single Fiori UI application](Option1.md), this has been updated with v3 of `@ui5/cli`
* Option 2. [Migrate Neo application supporting multiple Fiori UI applications](Option2.md), this is referencing v2 of `@ui5/cli`

In both cases, your application is deployed to Cloud Foundry using a managed approuter configuration.

![Alt text](LocalPreview.png?raw=true "UI App running in local preview mode")

![Alt text](RunningMigratedApplication.png?raw=true "UI App running in local preview mode")

## Extension Projects

Extension projects can be migrated using the Fiori tools migration tool.

See the [SAP Fiori Tools Migration Guide](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/70d41f3ee29d453a90efab3ce025d450.html?locale=en-US) for detailed instructions.

You may need to choose "Add Project" from the migration tab if your extension project is not already listed in the table.

For information on supported features, refer to [Supported Migration Features](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/f540ae1961914bf783cd266f3c0d8530.html?locale=en-US).

## Gotchas

### Issue 1
SAP Fiori Migration tool does not detect your application, ensure your exported project contains a `webapp` folder. If this folder is missing, generate a `webapp` folder inside the root of your project, move all your UI code but exclude application specific code, for example `neo-app.json`, `pom.xml`, `.che`.  

If you are also missing a `manifest.json` inside of your `webapp` folder, there is a help guide from the UI5 team to support this <https://sapui5.hana.ondemand.com/sdk/#/topic/3a9babace121497abea8f0ea66e156d9.html>.

### Issue 2

When running `npm run start` or local preview, the app fails to load, throwing the following exception in the console.

```text
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {  "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "Cannot read properties of undefined (reading 'getResourceBundle')\nTypeError: Cannot read properties of undefined (reading 'getResourceBundle')\n    at new constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:11:276)\n    at f.init (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:5:337)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:952\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:1036)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:623:577)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap/ui/core/library-preload.js:1015:189)\n    at new f (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:573:558)\n    at A (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:472)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:1279\n    at r (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:621:113)"}
```

To resolve this issue, the manifest.json and the Component.js ID's need to be synced.

Open the Component.js and look for the following code

```html
t.extend("ns.manageproductsneo.Component",{metadata:{manifest:"json"}
```

Open manifest.json and refer to the ID

```json
    "_version": "1.12.0",
    "sap.app": {
        "id": "manageproductsneo",
```

When running the start command, the app is being loaded with `test/flpSandbox.html`, the ID on lne 49 and 69 need to be updated to reflect the Component.js ID;

```text
Line 49: additionalInformation: "SAPUI5.Component=ns.manageproductsneo",
Line 69: data-sap-ui-resourceroots='{"ns.manageproductsneo": "../"}'
```

### Issue 3

In this sample app, there was an issue with the manifest.json. When the application was started up using `npm run start`, it threw the following error;

```text
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {    "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "invalid input\nTypeError: invalid input\n    at p.href (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:17025)\n    at new U (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:872)\n    at constructor._loadI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1147:113)\n    at constructor._processI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1146:339)\n    at new constructor (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1145:694)\n    at e._applyManifest (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:669:468)\n    at https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:654:456"}
```

To resolve this issue, the manifest i18n was changed from;

```json
"i18n": {
            "bundleUrl": "i18n/i18n.properties",
            "supportedLocales": [
                ""
            ],
            "fallbackLocale": ""
        },
```

To the following;

```json
"i18n": "i18n/i18n.properties",
```

If the issue persists, then try bumping the `"minUI5Version": "1.108.2"` in your manifest.json to a later version, here is a list of supported [UI5 versions](https://sapui5.hana.ondemand.com/versionoverview.html). Another option, where you want to only validate locally, then update `ui5.yaml` with a specific UI5 version, for example to specify `1.109.0`:

```yaml
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com
          version: 1.109.0
```

### Issue 4

Application is unable to load due to network errors relating to HTTP 403 when deployed to Cloud Foundry. This can be confirmed by reviewing the logs for your deployed application in SAP BTP cockpit under HTML5 Applications and selecting the logs icon next to your application.

The root cause is an issue with the scope applied in your `xs-app.json`. If the logged in user does not have the appropriate permissions, then add their ID to the role collection. In some instances, you may need to delete your session cookies or try using incognito mode to validate the new security roles are applied correctly.

### Issue 5

During your CI/CD pipeline job, the static code analysis throws a linting issue `Quality issue: JS_PARSING_ERROR:Very High!` when processing `locate-reuse-libs.js`.

This assumes, your `pom.xml` contains the following plugin;

```xml
<groupId>com.sap.ca</groupId>
<artifactId>analysis-plugin</artifactId>
<version>${sap.analysis.version}</version>
```

Example of current configuration

```xml
<sap.analysis.version>1.54.8</sap.analysis.version>
```

Proposed Configuration

```xml
<sap.analysis.version>2.0.4</sap.analysis.version>
```

Version Update Rationale

* Major version increment from 1.x to 2.x
* Potential breaking changes in static analysis rules
* Enhanced parsing capabilities
* Improved error detection mechanisms

### Issue 6

Application is unable to load due to network errors relating to HTTP 403 when deployed to Cloud Foundry. This can be confirmed by reviewing the logs for your deployed application in SAP BTP cockpit under HTML5 Applications and selecting the logs icon next to your application.

The root cause is an issue with the scope applied in your `xs-app.json`. If the logged in user does not have the appropriate permissions, then add their ID to the role collection. In some instances, you may need to delete your session cookies or try using incognito mode to validate the new security roles are applied correctly.

### Issue 7

The HTML5 application is deployed to Cloud Foundry, but the application is not loading; after reviewing the network console logs in your browser, an HTTP 404 Not Found error is returned;

Refer to this GA link for more information on how to resolve this issue;

<https://ga.support.sap.com/dtp/viewer/index.html#/tree/3046/actions/45995:45996:50742:51205:51192:51196:52513>

The issue is related to an AJAX API call that is defined using an absolute path instead of a relative path. Each application deployed to Cloud Foundry is given a unique GUID, which is how multiple apps can be deployed to the same subaccount. The absolute path is not able to resolve the GUID and therefore the application fails to load.

### Issue 8

The deployed Cloud Foundry HTML5 application renders as expected, but some features do not work as expected when running in SAP Business Application Studio in local preview mode.

This assumes your application is using the `fiori-tools-proxy` middleware to proxy API calls to back-end systems using SAP BTP destinations and you have started the application using `npm run start`.

To determine the root cause of your issue, review the Network tab in your browser's Developer Console. Connectivity issues can manifest as a HTTP 404 or CORS error.

#### Step 1. Review the `xs-app.json` File

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

The source path is `^/scim/(.*)$` which is a regular expression used to break up the URL path into string groups. Any API call starting with `/scim` are proxied to the `API_ENDPOINT` destination using the `$1` target path. In this instance, the `$1` target path reflects the URL segment after `/scim/`.

For example, an API call intercepted on Cloud Foundry `https://mysubdomain.launchpad.cfapps.eu10.hana.ondemand.com/a69add83-6355-4ba5-97d8-ad6fc0c912b7.mycommonhtml5app-0.0.1/scim/v2?sap-client=500` is proxied to the `API_ENDPOINT` SAP BTP destination as `https://internal.resource/v2?sap-client=500` where `scim` is removed from the API call.

This approach is typically used where a HTML5 application must support different back-end systems that may use the same path structure.

For the second route definition, `^/sap/(.*)$`, an API call intercepted at `https://mysubdomain.launchpad.cfapps.eu10.hana.ondemand.com/a69add83-6355-4ba5-97d8-ad6fc0c912b7.mycommonhtml5app-0.0.1/sap/opu/odata/sap/FIN_ACCOUNTING_IMPACT_SRV/?sap-client=500` is proxied to the `s4hc_onpremise` SAP BTP destination as `https://some.intneral.resource/sap/opu/odata/sap/FIN_ACCOUNTING_IMPACT_SRV/?sap-client=500` where `sap` is retained.

#### Review the `ui5.yaml` Configuration

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

After reviewing the `xs-app.json`, the `/scim/(.*)` source path is mapped to the `API_ENDPOINT` destination and expects the `/scim` to be stripped out of the proxied URL.

The root cause of the issue is that the local proxy makes the API call to `https://some.external.resource/scim/v2` which results in a HTTP 404 Not Found error because the back-end system is expecting the call to be made to `https://some.external.resource/`.

The solution is to update the `ui5.yaml` file to include the `pathReplace` property to strip out the `/scim` from the proxied URL.

```yaml
          - path: /scim
            pathReplace: /
            url: https://some.external.resource/scim/v2
            destination: API_ENDPOINT
```

Now, any request to `https://localhost:8080/scim/v2` is correctly proxied to the SAP BTP destination as `https://API_ENDPOINT.dest/v2` with `scim` removed.

Similarly, any request to `https://localhost:8080/sap` is correctly proxied to the SAP BTP destination as `https://s4hc_onpremise.dest/sap` with `sap` retained.

#### Reporting Issues

If you still face issues, please open a support incident with SAP. When doing so, please provide a full network trace (`.har` file) with all the requests in the scenario after it was reproduced.

For more information about how to extract the trace, see [How to capture an HTTP trace using Google Chrome or MS Edge (Chromium)](https://launchpad.support.sap.com/#/notes/1990706).

### License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../LICENSES/Apache-2.0.txt) file.

