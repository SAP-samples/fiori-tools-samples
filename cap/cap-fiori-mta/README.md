# Getting Started
Build and deploy a CAP Project API with a Fiori Elements UI and a managed approuter configuration hosted on SAP Business Technology Platform (BTP)

## Prerequisites
These are only required if deploying to Cloud Foundry (CF)
- You’ll need an SAP Cloud Platform trial [account](https://account.hana.ondemand.com/)
- You are subscribed to the [Launchpad Service](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html)
- Create an [SAP HANA Cloud Service instance](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58) or use an existing one

### Running on SAP Business Application Studio (SBAS)
- Create a [dev workspace](https://help.sap.com/viewer/c2b99f19e9264c4d9ae9221b22f6f589/2021_3_QRC/en-US/f728966223894cc28be3ca2ee60ee784.html) using a `Full Stack Cloud Application`

## Setup and Run Locally
- Open a terminal window and run `npm ci`
- Bind and publish to your [HANA Cloud Service instance](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html)
- Run `cds watch` to build and start your application
- Select `Open in New Tab` when prompted, a new browser tab should open
- Select your Fiori web application or select the `Books` service endpoint

## Build and Deploy to CF
Option 1 - Using [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool)
- If you've made any changes, right-click `mta.yaml` and select `Build MTA Project`
- Right-click `mta_archives -> managedAppCAPProject_1.0.0.mtar` and select `Deploy MTA Archive`
- This will prompt you for your CF details if you are not already logged in
- Your CAP Project will be successfully deployed to CF

Option 2 - Using cli
- Run the following command;
```shell
npm run build && npm run deploy
```
- This will prompt you for your CF details if you are not already logged in
- Your CAP Project will be successfully deployed to CF

## Verify Deployment
- Option 1 - Open a new terminal window and run, selecting the URL generated;
```shell
cf html5-list -u -di managedAppCAPProject-destination-service -u --runtime launchpad
```
- Option 2 - Using SAP BTP Cockpit, login to your SAP BTP subaccount, select `HTML5 Applications` from the left navigation tab and select your new Fiori application

## Undeploy
No longer want your CAP project hosted on SAP BTP, run the following command;
```shell
npm run undeploy
```

## Get Support

In case you've a question, find a bug, or otherwise need support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce) to get more visibility.

## License

Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
