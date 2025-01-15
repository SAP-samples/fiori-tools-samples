# Running CAP Headless

Append a SAP UI application with a managed approuter configuration to an existing CAP project, using the headless generator.  

# Prerequisites

- `@sap/cds-dk` is installed globally, if not, run `npm i -g @sap/cds-dk` from a new terminal window

# Create a CAP project (Optional)

Generate a CAP project with sample data and a HANA configuration;

```bash
cds init managedAppCAPProject && cd managedAppCAPProject && cds add tiny-sample && cds add hana && cds add mta && npm install && cds build --for hana && cp gen/db/package.json db && npm i
```

# Create a SAP Fiori UI and deployment configuration

Generate a new configuration file called `cap_app_config.json` and update the properties to reflect your CAP project, the CAP Service properties and the specific SAP Fiori project attributes.

```bash
touch cap_app_config.json
```

Amend the following configuration properties, this assumes the root folder is called `managedAppCAPProject`, only the target folder will differ between Business Application Studio (BAS) and VSCode;

```JSON
{
    "version": "0.1",
    "floorplan": "FE_LROP", // Fiori Elements List Report Object Page
    "project":
    {
        "title": "Project's \"Title\"",
        "description": "Test 'Project' \"Description\"",
        "namespace": "cap.namespace", // Update or remove if not required
        "ui5Version": "1.90.0",
        "localUI5Version": "1.82.2",
        "name": "mylropproject", // SAP Fiori UI project name
        "sapux": true,
        "targetFolder": "/Users/MyUser/Documents/managedAppCAPProject/app/" // Target location of new project appended with project name i.e. /Users/MyUser/Documents/managedAppCAPProject/app/mylropproject
    },
    "service":
    {
        "servicePath": "/odata/v4/catalog/",
        "capService":
        {
            "projectPath": "./",
            "serviceName": "CatalogService",
            "serviceCdsPath": "srv/cat-service.cds",
            "appPath": "app" // The CAP default apps folder, only update if not using default CAP settings
        }
    },
    "entityConfig":
    {
        "mainEntity":
        {
            "entityName": "Books"
        }
    },
    "deployConfig":
    {
        "deployTarget": "CF", // Cloud Foundry
        "destinationName": "fiori-default-srv-api", // Should be not be changed, reflects the destination instance exposing the CAP project
        "addToManagedAppRouter": true, // Toggle this value if a mananaged approuter already exists or if the using a standalone appprouter
        "addMTADestination": true // Toggle this value if the existing mta.yaml already contains a destination service that you want to use
    }
}
```

# Run headless generator

Inside the root of the newly created CAP project, run the headless generator with the SAP UI and deployment configuration;

```bash
yo @sap/fiori-elements:headless <path-to-config-file> <optional-path-to-output-or-cwd> <options>
```

Options:
--force : Overwrite the output files
--skipInstall: Skip the install phase
--deleteFile: Delete the input app configuration file
--logLevel debug | info

For example;

```bash
yo @sap/fiori:headless ./cap_app_config.json ./
```

With `logLevel` and `skipInstall` enabled;
```bash
yo @sap/fiori:headless ./cap_app_config.json --logLevel debug --skipInstall
```

# Gotchas

1. If you want to generate a SAP Fiori UI application without any Cloud Foundry deployment configuration, then remove `deployConfig` from `cap_app_config.josn`.
2. If you have created a CAP project using an existing `managed` or `standalone` approuter configuration, then `addToManagedAppRouter` should be removed or set to `false`.

### License
Copyright (c) 2009-2025 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
