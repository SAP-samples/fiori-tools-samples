# Migrating HTML5 Applications from the SAP BTP, Neo to Cloud Foundry

For more information, see [Migrating HTML5 Applications from SAP BTP, Neo to Cloud Foundry](https://help.sap.com/docs/HTML5_APPLICATIONS/b98f42a4d2cd40a9a3095e9f0492b465/b1763fd06421457b9970a3555020e750.html).

Learn how to migrate custom HTML5 applications on SAP BTP from the Neo to the Cloud Foundry environment.

## Prerequisites

- You have an SAP Business Technology Platform (SAP BTP) account.
- You are subscribed to SAP Business Application Studio. For more information, see [Getting Started with SAP Business Application Studio](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html).
- You are subscribed to the SAP Fiori launchpad service. For more information, see [Set Up the SAP Launchpad Service](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- If the referenced services are not available in Service Marketplace, select Entitlements from the root of your subaccount, select Configure Entitlements, locate the required service, create it, save it, and then return to the Service Marketplace to add the required service to your subaccount.

## Create an SAP Fiori Dev Space

From your SAP BTP cockpit, select Instances and Subscriptions, select SAP Business Application Studio, and open your dev space manager in a new tab. Generate a Full Stack Cloud Application dev space with SAP HANA Tools enabled.

## Migrate Security and Destinations

Generate a new migration folder to contain all your existing Neo settings:

```bash
mkdir -p /home/user/projects/neo/
```

Upload `*.mtar` | `*.zip`, `mta.yaml` to the migration folder

Create base configs, required to migrate the destinations from your old Neo subaccount:

```bash
touch xs-security.json mtad.yaml config.json
```

Sample configurations for each respective file:

`mtad.yaml` File

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

`config.json` File

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

`xs-security.json` File

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

> **Note:** This destination creates destinations at `subaccount` level: all applications deployed to this subaccount have access to these destinations. For more information about how to generate instance-based destinations where the destinations are encapsulated as part of the deployed application, see the [Build and Deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a Managed Approuter Configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) blog post.

Security configuration uses a global role collection that can be consumed by apps using the MTA ID and the scoped name, that is, `migrationcf.globalrole`. In this instance, it's only for demo purposes and the respective applications manage their own security concerns by creating their own roles and templates in the `xs-security.json` attached to the project.

For more information about Security Administration, see the [SAP BTP Security Administration](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/1ff47b2d980e43a6b2ce294352333708.html) guide.

Ensure you are logged into Cloud Foundry target system where the new settings must be applied:

```bash
cf login -a <api-endpoint -o <organisation> -s <space>
```

or else from SAP Business Application Studio, run `View -> Command Palette -> Login to Cloud Foundry`

Deploy the new services to your new subaccount target system:

```bash
cf deploy
```

Your subaccount is now configured with destinations at the subaccount level.

## Importing an Application Without Source Control

If you are a Public Cloud customer without access to a source code repository, you can download your application source artefacts using HTTP with SAP Fiori Tools. This is the recommended approach when your Neo application is deployed but its source code is not available in a version control system.

For more information, see [Importing an Application without Source Control](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/ab4657ca9bd84cd6869a750a1d94b5bd.html).

Once you have downloaded the application source artefacts, follow one of the following migration options.

1. [Migrate Neo application for a single SAP Fiori UI application](Option1.md)
2. [Migrate Neo application supporting multiple SAP Fiori UI applications](Option2.md)

In both cases, your application is deployed to Cloud Foundry using a managed approuter configuration.

![Alt text](LocalPreview.png?raw=true "UI App running in local preview mode")

![Alt text](RunningMigratedApplication.png?raw=true "UI App running in local preview mode")

## Extension Projects

Extension projects can be migrated using SAP Fiori tools migration tool.

For more information, see [SAP Fiori Tools Migration](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/70d41f3ee29d453a90efab3ce025d450.html?locale=en-US).

You must choose "Add Project" from the migration tab if your extension project is not already listed in the table.

For more information about supported features, see [Supported Migration Features](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/f540ae1961914bf783cd266f3c0d8530.html?locale=en-US).

## Upgrading `@ui5/cli` to v4

For guidance on upgrading `@ui5/cli` to v4 after migration, see [Upgrading `@ui5/cli` to v4](upgrading-ui5-cli.md).

## Troubleshooting

For common issues and fixes, see [Troubleshooting](troubleshooting.md).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../LICENSES/Apache-2.0.txt) file.
