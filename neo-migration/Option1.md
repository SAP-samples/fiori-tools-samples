# Option 1. Migrate Neo application using a managed approuter

Unzip your mtar or zip file, this will contain additional files that are required to further unzipped. If this is not the case, please continue to the next step;
```BASH
unzip /home/user/projects/neo/solution.mtar -d /home/user/projects/neo/
```

Generate a new Fiori UI folder which will contain your Neo UI application
```
mkdir -p /home/user/projects/fioriapp
```

Unzip the contains of the Neo UI appliation into the Fiori UI application folder
```BASH
unzip /home/user/projects/neo/manageproductsneo.zip -d /home/user/projects/fioriapp/
```

You now have a new folder with the contains for your export Neo UI application, ready for migration.

From View -> Command Palette, run `Fiori: Migrate Project for use in Fiori Tools`
- select project and ensure SAPUI5 preview version is latest or appropiate to your project
- Start migration
- A migration results screen will show, giving you options if there is any issues that need to be addressed
- An application information page will also load, showing details of your app and commands you can run against it

From View -> Command Palette, run `Neo Migration: HTML 5 Application descriptor transformation`
- Select your neo-app.json
- new xs-app.json created in UI project with the routes populated from your old neo-app.json
- If this is overwritten or deleted, please re-run this step again, it needs to be generated using the neo-app.json as the source

Change into the new UI application
```
cd /home/user/projects/fioriapp
```

From View -> Command Palette, run `npm run deploy-config cf`
- Select destination `none`, not reqired as the `xs-app.json` is already created in the previous step
- Add application to managed application router - Yes
- Overwrite xs-app.json - No, this was created in the previous step, if you select yes, then just re-run the previous step again
- Review `ui5.yaml` and `ui5-deploy.yaml` to ensure parameters look good

To start up Fiori UI application locally, run `npm run start` to ensure you can preview the UI locally on BAS

To build the application for Cloud Foundry, run `npm run build:mta` to build the MTA archive

__SECURITY ALERT__

The generated `xs-security.json` does not contain any scopes or roles, append the following scopes as these will provide security collections that can be managed at subaccount level;

```JSON
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

In order to apply these scopes to your applicaiton, update the `xs-app.json` routes that you require specific roles;
```JSON
    {
      "source": "^/northwind/(.*)$",
      "target": "$1",
      "destination": "northwind",
      "csrfProtection": false,
      "scope": "$XSAPPNAME.migratedroleapp"
    },
```

To deploy the generated MTA archive to Cloud Foundry, run `npm run deploy`

Within the root of your project, open a terminal window and run `cf html5-list -u -di ns-manageproductsneo-destination-service -u --runtime launchpad` to retrieve the URL of the deployed app or else login to SAP BTP cockpit, subaccount, HTML5 Applications

For additonal commands, please refer to the `package.json`.

Your project is now migrated and deployed to CF. Ensure you user profile is mapped to the correct role collections in order to access the deployed application otherwise you will get a HTTP 403 error when trying to access the scoped route.

![Alt text](ViewerPublicRole.png?raw=true "Viewer role")

If you want to undeploy it, then run `npm run undeploy`.
