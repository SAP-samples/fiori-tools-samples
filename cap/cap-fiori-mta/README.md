# Get Started with SAP Cloud Application Programming Model (CAP) Using SAP Fiori Tools and Managed Approuter

Build and deploy a CAP project API with an SAP Fiori elements UI and a managed approuter configuration hosted on SAP Business Technology Platform (BTP).

This CAP project was generated using the steps outlined in the [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) blog post using the `Managed Approuter` configuration as the HTML5 application runtime. 

## Prerequisites
The following prerequisites are only required if deploying to Cloud Foundry:
- You have an SAP Cloud Platform trial account. For more information, see [SAP Business Technology Platform](https://account.hana.ondemand.com/).
- You are subscribed to the SAP Fiori launchpad service. For more information, see [Set Up SAP Build Work Zone, standard edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- You have created an SAP HANA Cloud Service instance or are using an existing one. For more information, see [SAP HANA Cloud Service Instance](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58) tutorial.

## How to Use SAP Business Application Studio
- Create a dev workspace using a `Full Stack Cloud Application`. For more information, see [Set up a Development Space for Full-Stack Cloud Applications](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-developer-guide-for-cloud-foundry-multitarget-applications-sap-business-app-studio/set-up-development-space-for-full-stack-cloud-applications?version=2026_1_QRC).

## Run Locally
1. Open a terminal window and run `npm ci`.
2. Bind and publish to your HANA Cloud service instance. For more information, see [Create an SAP HANA Database Project](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html).
3. Run `cds watch` to build and start your application.
4. Click `Open in New Tab` when prompted and a new browser tab opens.
5. Select your SAP Fiori web application or select the `Books` service endpoint.

## Build and Deploy to Cloud Foundry

### Using the [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool)
1. Right-click the `mta.yaml` file and click `Build MTA Project`.
2. Right-click `mta_archives -> managedAppCAPProject_1.0.0.mtar` and click `Deploy MTA Archive`.
If you aren't logged in, you're prompted for your Cloud Foundry credentials. Then, your CAP project is deployed to Cloud Foundry.

### Using the CLI
- Run the following command:
```shell
npm run build && npm run deploy
```
If you aren't logged in, you're prompted for your Cloud Foundry credentials. Then, your CAP project is deployed to Cloud Foundry.

## Verify Deployment
### Using the CLI
1. Open a new terminal window and run:
```shell
cf html5-list -u -di managedAppCAPProject-destination-service -u --runtime launchpad
```
2. Select the URL you generated.

### Using SAP BTP

1. Go to the SAP BTP Cockpit and login to your SAP BTP subaccount.

2. Click `HTML5 Applications` from the navigation sidebar and select your new SAP Fiori application.

## Undeploy
To remove your Cloud Foundry project from SAP BTP, run the following command:
```shell
npm run undeploy
```

## Get Support

If you need support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce).

## License
Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.

