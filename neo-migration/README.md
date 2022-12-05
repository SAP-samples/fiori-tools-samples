# Migrating HTML5 Applications from the SAP BTP, Neo to Cloud Foundry

Referenced guide https://help.sap.com/docs/HTML5_APPLICATIONS/b98f42a4d2cd40a9a3095e9f0492b465/b1763fd06421457b9970a3555020e750.html

Learn how to migrate custom HTML5 applications on SAP BTP from the Neo to the Cloud Foundry environment.

# Prerequisites

- You’ll need an SAP Business Technology Platform (SAP BTP) account
- You are subscribed to SAP Business Application Studio, follow this [tutorial](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html) for more information
- You are subscribed to the SAP Launchpad Service, follow this [tutorial](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html) for more information
- If the referenced services are not available in Service Marketplace, please select Entitlements from the root of your subacacount, select Configure Entitlements, locate the required service, create it, save it and then return to the Service Marketplace to add the required service to your subaccount.

# Create SAP Fiori Dev Space

From your SAP BTP cockpit, select Instances and Subscriptions, select SAP Business Application Studio which will open a new tab into your dev space manager. Generate a Full Stack Cloud Application dev space with SAP HANA Tools enabled.

# Migrate Security and Destinations
Generate new migration folder to contain all your existing Neo settings;
```BASH
mkdir -p /home/user/projects/neo/
```

Upload *.mtar | *.zip, mta.yaml following files to the migration folder

Create base configs, required to migrate the security and destinations from your old Neo subaccount
```
cd /home/user/projects/neo/
touch xs-security.json mtad.yaml config.json
```

Sample configurations for each respective file;
mtad.yaml
```YAML
_schema-version: "3.1"
ID: migrationcf
description: Migrate services
version: 1.0.0
resources:
- name: my_html5_uaa
  type: com.sap.xs.uaa
  parameters:
    service-plan: application    
    path: xs-security.json
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
```JSON
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
```JSON
{
    "xsappname": "migrationcf",
    "tenant-mode": "dedicated",
    "description": "Security profile of called application",
    "scopes":[
      {
        "name": "$XSAPPNAME.role2",
        "description": "Migrated role"
      }
    ],
    "role-templates": [
      {
        "name": "role2",
        "description": "Migrated Role Template",
        "scope-references": [
        "$XSAPPNAME.role2"
        ]
      }
    ]
}
```

Ensure you are logged into CF target system where the new settings need to be applied;
```BASH
cf login -a <api-endpoint -o <organisation> -s <space>
```
or else from BAS, run `View -> Command Palette -> Login to Cloud Foundry`

Deploy the new services to your new subaccount target system
```BASH
cf deploy
```

Your subaccount is now configured with destinations and security settings, required for your new Fiori UI application.

You have two options of migratating your Neo UI application as each produces a different folder stucture;
- Option 1. [Migrate Neo application for a single Fiori UI application](Option1.md)
- Option 2. [Migrate Neo application supporting multiple Fiori UI applications](Option2.md)

In both cases, your application is deployed to Cloud Foundry using a managed approuter configuration.

![Alt text](LocalPreview.png?raw=true "UI App running in local preview mode")

![Alt text](RunningMigratedApplication.png?raw=true "UI App running in local preview mode")

# Gotchas

## Issue 1
When running `npm run start` or local preview, the app fails to load, throwing the following exception in the console.

```
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {  "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "Cannot read properties of undefined (reading 'getResourceBundle')\nTypeError: Cannot read properties of undefined (reading 'getResourceBundle')\n    at new constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:11:276)\n    at f.init (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/Component-preload.js:5:337)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:952\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:346:1036)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:623:577)\n    at f.constructor (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap/ui/core/library-preload.js:1015:189)\n    at new f (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:573:558)\n    at A (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:472)\n    at https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:658:1279\n    at r (https://port8080-workspaces-ws-z5hjg.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:621:113)"}
```
To resolve this issue, the manifest.json and the Component.js ID's need to be synced.

Open the Component.js and look for the following code
```HTML
t.extend("ns.manageproductsneo.Component",{metadata:{manifest:"json"}
```
Open manifest.json and refer to the ID
```JSON
    "_version": "1.12.0",
    "sap.app": {
        "id": "manageproductsneo",
```

When running the start command, the app is being loaded with `test/flpSandbox.html`, the ID on lne 49 and 69 need to be updated to reflect the Component.js ID;
```
Line 49: additionalInformation: "SAPUI5.Component=ns.manageproductsneo",
Line 69: data-sap-ui-resourceroots='{"ns.manageproductsneo": "../"}'
```

## Issue 2
In this sample app, there was an issue with the manifest.json. When the application was started up using `npm run start`, it threw the following error;

```
Title: ErrorMessage: App could not be opened because the SAP UI5 component of the application could not be loaded.Details: {    "info": "Failed to load UI5 component for navigation intent \"#app-tile\"", "technicalMessage": "invalid input\nTypeError: invalid input\n    at p.href (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:17025)\n    at new U (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:2096:872)\n    at constructor._loadI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1147:113)\n    at constructor._processI18n (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1146:339)\n    at new constructor (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:1145:694)\n    at e._applyManifest (https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:669:468)\n    at https://port8080-workspaces-ws-v6s28.cry10.int.applicationstudio.cloud.sap/resources/sap-ui-core.js:654:456"}
```
To resolve this issue, the manifest i18n was changed from;

```JSON
"i18n": {
            "bundleUrl": "i18n/i18n.properties",
            "supportedLocales": [
                ""
            ],
            "fallbackLocale": ""
        },
```
To the following;
```JSON
"i18n": "i18n/i18n.properties",
```
