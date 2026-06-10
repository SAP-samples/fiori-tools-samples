# Option 2: Configure MTA with Multiple Migrated Neo UI Applications

From `View -> Command Palette`, run `Open CF Application Router Generator`

- Change router path, that is, `/home/user/projects`.
- Select `Managed Approuter`.
- Enter a unique MTA ID that does not conflict with any other existing configurations, that is, `managedapp`.

Change into the new `managedapp` folder, which is the root of your project structure:

```bash
cd /home/user/projects/managedapp/
```

Unzip your exported Neo mtar or zip file. The contents may require additional files to be unzipped. If this is not the case, continue to the next step:

```bash
unzip /home/user/projects/neo/solution.mtar -d /home/user/projects/neo/
```

Unzip the Neo application into a new sub folder:

```bash
unzip /home/user/projects/neo/manageproductsneo.zip -d /home/user/projects/managedapp/fioriapp
```

Run `Fiori: Migrate Project for use in Fiori tools`:

- Select your project and ensure the SAPUI5 preview version is the latest or appropriate for your project.
- Select `Start migration`.
- A migration results screen shows, which gives you options if there are any issues that must be addressed.
- An application information page also loads, which shows the details of your app and the commands you can run against it.

Run `Neo Migration: HTML 5 Application descriptor transformation`:

- Select your `neo-app.json` file.
- A new `xs-app.json` file is created in the UI project with the routes populated from your old `neo-app.json` file.
- If this is overwritten or deleted, re-run this step again: it must be generated using the `neo-app.json` file as the source.

Change into the new SAP Fiori UI application:

```bash
cd /home/user/projects/managedapp/fioriapp
```

Run `npm run deploy-config cf`:

- Select destination `none`. This is not required as the `xs-app.json` file was already created in a previous step.
- Overwrite `xs-app.json` file: No. This file was created in the previous step. If you select yes, re-run the previous step.
- Review the `ui5.yaml` and `ui5-deploy.yaml` files to ensure the parameters are correct.

Run `npm run start` to preview the UI in SAP Business Application Studio.

Run `npm run build` to build the MTA archive with all the SAP Fiori UI applications.

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

To apply these scopes to your application, update the `xs-app.json` routes to require specific roles:

```json
    {
      "source": "^/northwind/(.*)$",
      "target": "$1",
      "destination": "northwind",
      "csrfProtection": false,
      "scope": "$XSAPPNAME.migratedroleapp"
    },
```

Run `npm run deploy` to deploy the MTA archive to Cloud Foundry.

Run `cf html5-list -u -di managedapp-destination-service -u --runtime launchpad` to retrieve the URL of the deployed app, or log in to the SAP BTP cockpit and navigate to your subaccount > HTML5 Applications.

Your project is now migrated and deployed to Cloud Foundry. Ensure your user profile is mapped to the correct role collections in order to access the application, otherwise you receive an HTTP 403 error when you try to access the scoped route.

If you want to undeploy it, then run `npm run undeploy`.

To support additional UIs being added to the root `mta.yaml` file, follow the same steps, which ensures your migrated app is added as a sub folder to the `managedapp` folder.
