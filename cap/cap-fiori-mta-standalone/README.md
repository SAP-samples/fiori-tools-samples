# Get Started with SAP Cloud Application Programming Model (CAP) Using SAP Fiori Tools and Standalone Approuter

Build and deploy a CAP Project API with an SAP Fiori elements UI and a standalone approuter configuration hosted on SAP Business Technology Platform (BTP) using an in-memory database.

This CAP project was generated using the steps outlined in the [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) blog post using the `Standalone Approuter` configuration as the HTML5 application runtime. 

## Prerequisites
These are only required if deploying to Cloud Foundry (CF).
- You have an SAP Cloud Platform account. For more information, see [SAP Business Technology Platform Cockpit](https://account.hana.ondemand.com/).
- You are subscribed to the SAP Fiori launchpad service. For more information, see [Set Up SAP Build Work Zone, standard edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- You have an API Endpoint, for example, `https://api.cf.us10-001.hana.ondemand.com`, which can be found in your subaccount overview page. This must be appended to the `oauth2-configuration` in the `xs-security.json` file.
- SAP Business Application Studio only: You have an SAP Fiori or Full Stack Cloud Application dev workspace. For more information, see [Set up a Development Space for Full-stack Cloud Applications](https://help.sap.com/viewer/c2b99f19e9264c4d9ae9221b22f6f589/2021_3_QRC/en-US/f728966223894cc28be3ca2ee60ee784.html).

## Run Locally
- Open a terminal window and run `npm i`.
- Run `cds watch` to build and start your application.
- Click `Open in New Tab` when prompted and a new browser tab opens.
- Select your SAP Fiori web application or select the `Books` service endpoint.

## Build and Deploy to Cloud Foundry
### Using the [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool)
- Ensure the `xs-security.json` file is updated with the correct `oauth2-configuration` API region settings.
- Right-click the `mta.yaml` file and click `Build MTA Project`.
- Right-click `mta_archives -> standaloneCAPProject_1.0.0.mtar` and click `Deploy MTA Archive`.
- You are prompted for your Cloud Foundry details if you are not already logged in.
- Your CAP Project is deployed to Cloud Foundry.

### Using the CLI
- Ensure the `xs-security.json` file is updated with the correct `oauth2-configuration` API region settings.
- Run the following command:
```shell
npm run build && npm run deploy
```
- You are prompted for your Cloud Foundry details if you are not already logged in.
- Your CAP Project is deployed to Cloud Foundry. Click the second generated application URL, for example `<subdomain>-<space>-standalonecapproject-approuter.cfapps.<api-region>.hana.ondemand.com`.

## Verify Deployment
### Using the Terminal
- Open a new terminal window and run the following command:
```shell
cf mta standaloneCAPProject
```

Click the second URL generated under the `urls` column.

### Using SAP BTP Cockpit
1. Login to your SAP BTP subaccount, click Overview and Spaces.

2. Choose the space where the application was deployed to and select the name of your deployed approuter, for example `standalonecapproject-approuter`. This displays the application routes to your SAP Fiori application.

## Undeploy
To remove your CAP project from SAP BTP, run the following command:
```shell
npm run undeploy
```

## Known Issues
To support connectivity to on-premise systems, uncomment the code in the `mta.yaml` file and enable the `standaloneCAPProject-connectivity` service. Remember, the SAP Connectivity service lets you establish connectivity between your cloud applications and on-premise systems rwhich run in isolated networks.

## Get Support

If you have any questions, find a bug, or need support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce).

## License
Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.

