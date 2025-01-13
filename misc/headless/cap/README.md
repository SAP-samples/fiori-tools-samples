# Running CAP Headless

Append a SAP UI application with a managed approuter configuration to an existing CAP project, using the headless generator.  

# Prerequisites

- You have `@sap/cds-dk` installed globally, if not, run `npm i -g @sap/cds-dk` from a new terminal window

# Create a CAP project (Optional)

Generate a CAP project with sample data and with HANA support;

```bash
cds init managedAppCAPProject && cd managedAppCAPProject && cds add tiny-sample && cds add hana && cds add mta && npm install && cds build --for hana && cp gen/db/package.json db && npm i
```

# Create a SAP Fiori UI and deployment configuration

Generate a new configuration file called `cap_app_config.json` and update the properties to reflect your CAP project, the CAP Service properties and the specific SAP Fiori project attributes.

```bash
touch cap_app_config.json
```

Append the following configuration, assuming the root folder is called `managedAppCAPProject` depending on your development environmentm Business Application Studio or VSCode;

## VSCode 

```JSON
{
    "version": "0.1",
    "floorplan": "FE_LROP", // Fiori Elements List Report Object Page
    "project":
    {
        "title": "Project's \"Title\"",
        "description": "Test 'Project' \"Description\"",
        "namespace": "testNameSpace",
        "ui5Version": "1.90.0",
        "localUI5Version": "1.82.2",
        "name": "mylropproject",
        "sapux": true,
        "targetFolder": "/Users/Documents/managedAppCAPProject/app/"
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
        "deployTarget": "CF",
        "destinationName": "fiori-default-srv-api", // This is a predefined field, should only be updated if the destination is outside the scope of the project i.e. subaccount
        "addToManagedAppRouter": true, // Toggle this value if a mananaged approuter already exists or if the using a standalone appprouter
        "addMTADestination": true // Toggle this value if the existing mta.yaml already contains a destination service
    }
}
```
## Business Application Studio

```JSON
{
    "version": "0.1",
    "floorplan": "FE_LROP", // Fiori Elements List Report Object Page
    "project":
    {
        "title": "Project's \"Title\"",
        "description": "Test 'Project' \"Description\"",
        "namespace": "testNameSpace",
        "ui5Version": "1.90.0", // Update to latest if required
        "localUI5Version": "1.82.2", // Update to latest if required
        "name": "mylropproject",
        "sapux": true,
        "targetFolder": "/home/user/projects/managedAppCAPProject/app/"
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
        "deployTarget": "CF",
        "destinationName": "fiori-default-srv-api", // This is a predefined field, should only be updated if the destination is outside the scope of the project i.e. subaccount
        "addToManagedAppRouter": true, // Toggle this value if a mananaged approuter already exists or if the using a standalone appprouter
        "addMTADestination": true // Toggle this value if the existing mta.yaml already contains a destination service
    }
}
```
# Run headless generator

Inside the root of the newly created CAP project, run the headless generator with the SAP UI and deployment configuration;

```bash
yo @sap/fiori-elements:headless <path-to-config-file> <optional-path-to-output-or-cwd>
```

For example;

```bash
yo @sap/fiori:headless ./cap_app_config.json ./
```

With debugging enabled;
```bash
yo @sap/fiori:headless ./cap_app_config.json ./ --logLevel debug
```

### License
Copyright (c) 2009-2025 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
