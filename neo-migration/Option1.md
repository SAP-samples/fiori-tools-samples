# Option 1: Migrate Neo Application Using a Managed Approuter

Unzip your exported Neo mtar or zip file. The contents may require additional files to be unzipped. If this is not the case, continue to the next step:

```bash
unzip /home/user/projects/neo/solution.mtar -d /home/user/projects/neo/
```

Generate a new SAP Fiori UI folder to contain your Neo UI application:

```bash
mkdir -p /home/user/projects/fioriapp
```

Unzip the contents of the Neo UI application into the SAP Fiori UI application folder:

```bash
unzip /home/user/projects/neo/manageproductsneo.zip -d /home/user/projects/fioriapp/
```

You have a new folder with the contents of your exported Neo UI application, ready for migration.

From View -> Command Palette, run `Fiori: Migrate Project for use in Fiori tools`

- Select project and ensure the SAPUI5 preview version is latest or appropriate to your project.
- Start migration.
- A migration results page loads, which gives you a summary of any issues that must be addressed.
- An application information page also loads, which shows the details of your app and the commands you can run against it.

From View -> Command Palette, run `Neo Migration: HTML 5 Application descriptor transformation`.

- Select the `neo-app.json` file.
- A new `xs-app.json` file is created with the routes populated from your old `neo-app.json` file, ready for Cloud Foundry deployment.
- If the `xs-app.json` file is overwritten or deleted, re-run this step again: it needs to be generated using the `neo-app.json` file as the source.

Change into the new UI application:

```bash
cd /home/user/projects/fioriapp
```

From View -> Command Palette, run `npm run deploy-config cf`

- Select destination `none`. This is not required as the `xs-app.json` file was already created in the previous step.
- Add application to managed application router: Yes.
- Overwrite the `xs-app.json` file: No. This file was created in the previous step. If you select yes, re-run the previous step.
- Review the `ui5.yaml` and `ui5-deploy.yaml` files to ensure the parameters are correct.

To start the SAP Fiori UI application locally, run `npm run start` to preview the UI in SAP Business Application Studio.

To build the application for Cloud Foundry, run `npm run build:mta` to build the MTA archive.

## Security Alert

The generated `xs-security.json` file does not contain any scopes or roles. Add the following scopes as these provide security collections that can be managed at the subaccount level:

```json
  "scopes":[
    {
      "name": "$XSAPPNAME.migratedroleapp",
      "description": "Migrated scope from managed app"
    }
  ],
  "role-templates": [
    {
      "name": "migratedroleapp",
      "description": "Migrated Role Template from managed app",
      "scope-references": [
      "$XSAPPNAME.migratedroleapp"
      ]
    }
  ],
  "role-collections": [
    {
      "name": "ViewerPUBLIC",
      "description": "Viewer (public) from migrated app",
      "role-template-references": [
        "$XSAPPNAME.migratedroleapp"
      ]
    }
  ]
  ```

To apply these scopes to your application, update the `xs-app.json` file routes to require specific roles:

```json
    {
      "source": "^/northwind/(.*)$",
      "target": "$1",
      "destination": "northwind",
      "csrfProtection": false,
      "scope": "$XSAPPNAME.migratedroleapp"
    },
```

To deploy the generated MTA archive to Cloud Foundry, run `npm run deploy`.

Within the root of your project, open a terminal window and run `cf html5-list -u -di ns-manageproductsneo-destination-service -u --runtime launchpad` to retrieve the URL of the deployed app, or log in to the SAP BTP cockpit and navigate to your subaccount > HTML5 Applications.

For additional commands, see the `package.json` file.

Your project is now migrated and deployed to Cloud Foundry. Ensure your user profile is mapped to the correct role collections to access the deployed application, otherwise you receive an HTTP 403 error when you try to access the scoped route.

![Alt text](ViewerPublicRole.png?raw=true "Viewer role")

To undeploy, run `npm run undeploy`.
