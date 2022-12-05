# Option 2. Configure MTA with multiple migrated Neo UI applications

From `View -> Comamnd Palette`, run `Open CF Application Router Generator`
- Change router path i.e. `/home/user/projects`
- select `Managed Approuter`
- Enter a unique MTA ID that will not conflict with any other existing configurations i.e. `managedapp`

Change into new folder;
```
cd /home/user/projects/managedapp/
```

Unzip the Neo application into a sub folder of /home/user/projects/managedapp;
```
unzip /home/user/projects/neo/manageproductsneo.zip -d /home/user/projects/managedapp/fioriapp
```

Run `Fiori: Migrate Project for use in Fiori Tools`
- Select your project and ensure SAPUI5 preview version is latest or appropiate to your project
- Select `Start migration`
- A migration results screen will show, giving you options if there is any issues that need to be addressed
- An application information page will also load, showing details of your app and commands you can run against it

Run `Neo Migration: HTML 5 Application descriptor transformation`
- Select your `neo-app.json`
- New `xs-app.json` created in UI project with the routes populated from your old `neo-app.json`
- If this is overwritten or deleted, please re-run this step again, it needs to be generated using the `neo-app.json` as the source

Change into the new Fiori UI application
```
cd /home/user/projects/managedapp/fioriapp
```

Run `npm run deploy-config cf`
- Select destination `none`, not reqired as the `xs-app.json` is already created from a previous step
- Overwrite xs-app.json - No, this was created in the previous step, if you select yes, then just re-run the previous step again
- Review `ui5.yaml` and `ui5-deploy.yaml` to ensure parameters look good

Run `npm run start` to ensure you can preview the UI locally on BAS

Run `npm run build` to build the MTA archive with all the Fiori UI applications

Run `npm run deploy` to deploy the MTA archive to CF

Run `cf html5-list -u -di managedapp-destination-service -u --runtime launchpad` to retrieve the URL of the deployed app or else login to SAP BTP cockpit, subaccount, HTML5 Applications

Your project is now migrated and deployed to CF. If you want to undeploy it, then run `npm run undeploy`.

__To support additional UI's being appended to the root `mta.yaml` you follow the same steps, ensuring your migrated app is added a sub folder to the managedapp folder.___

