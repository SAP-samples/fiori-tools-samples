# Get Started with SAP Cloud Application Programming Model (CAP) using SAP Fiori Tools and Managed Approuter with a Hybrid Profile

Build and deploy a CAP Project API with an SAP Fiori elements UI to Cloud Foundry (CF) using a managed approuter configuration hosted on SAP Business Technology Platform (SAP BTP). The project uses an SAP CAP hybrid profile for testing and development. For more information, see [Hybrid Testing](https://cap.cloud.sap/docs/advanced/hybrid-testing).

The CAP project was generated using the `Managed Approuter` configuration as the HTML5 application runtime. For more information, see [Build and deploy a CAP Project Node.js API with a SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/).

This repository showcases how a CAP project with an SAP Fiori UI is developed and tested using a `production-near` environment. The SAP CAP hybrid approach allows you to:

* Work with a HANA HDI database instance. 
* Leverage real user authentication.

The benefit of the SAP CAP hybrid approach is you can switch between local mock configuration and cloud service configuration by simply setting or omitting the hybrid profile parameter.

Fpr more information on the local changes required to support a CDS hybrid testing and development environment, see [Changes](changes.md).

## Prerequisites
- You have created an SAP Cloud Platform Trial Account. For more information, see [SAP Business Technology Platform](https://account.hana.ondemand.com/).
- You are subscribed to the SAP Fiori Launchpad Service. For more information, see [Set Up SAP Build Work Zone, Standard Edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- You have created an SAP HANA Cloud Service instance and ensured the service instance is running. For more information, see [SAP HANA Cloud Service](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58)
- You have created a "Full Stack Cloud Application" dev space. For more information, see [Set up a Development Space for Full-Stack Cloud Applications](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-developer-guide-for-cloud-foundry-multitarget-applications-sap-business-app-studio/set-up-development-space-for-full-stack-cloud-applications?version=2025_3_QRC).

## Setup and Run Locally

- Clone the repository: `git clone https://github.com/SAP-samples/fiori-tools-samples.git`.
- Navigate to the CAP hybrid project in the terminal: `cd fiori-tools-samples/cap/cap-fiori-hybrid`.
- Log in to your CF environment: `View` -> `Command Palette` -> `CF: Login to Cloud Foundry`.
- Right-click your CAP project and click `Open in Integrated Terminal`.
- Install the required dependencies `npm run install:app`
- Build the CAP and Fiori UI applications `npm run build`
- Deploy the CAP and Fiori UI applications `npm run deploy`

__CAP project is configured with security roles, any changes made locally need to be reflected both locally and remotely__

- Update the XSUAA security service `npm run cf:uaa:update`

__Ensure the security roles defined in `xs-security.json` are assigned to your user__

- [Set up the roles](https://cap.cloud.sap/docs/node.js/authentication#auth-in-cockpit) for your application 

__Push some data to HANA__

The CAP project was created with samples, edit the csv file in the `data` folder

- Run `npm run deploy:hana`

__At this point, you have deployed your application to CF, if you run the CAP project locally using `npm run start` it will spin up the project using an in-memory database instance. Deployment has to occur first for the remaining steps to work as this will leverage the deployed HANA and UAA service instances__

- Bind to the XSUAA service `cds bind -2 managedAppCAPProject-xsuaa-service --kind xsuaa`
- Bind to the HANA HDI service `cds bind -2 managedAppCAPProject-db`
- Spin up your CAP project in hybrid mode `npm run watch:hybrid` but don't click the `Open in a New Tab` prompt since this is not authenticating the user with XSUAA security
- The console output will show HANA connectivity;

```
[cds] - connect using bindings from: { registry: '~/.cds-services.json' }
[cds] - connect to db > hana {
```

__To imitate a `production-near` environment, you need to route the HTTP requests to your SAP BTP XSUAA and HANA services. The `localrouter` will fetch a valid token from the XSUAA instance and attach it to every subsequent request.__

- Install the local approuter `npm run install:localrouter`
- Spin up the local approuter `cds bind --exec -- npm start --prefix localrouter`
- Open your CAP Project using the `localrouter:5001` endpoint, `View` -> `Ports: Preview` -> select port 5001
- Open the new browser tab and select your Fiori UI application

## Gotchas

### Forbidden

You have tried to load your Fiori UI application on port 5001 but get the following error message;
```
Application could not be started due to technical issues.
Forbidden
```

Please ensure you have assigned your email address to the `capuser` role in your SAP BTP cockpit under security, follow [this guide](https://cap.cloud.sap/docs/node.js/authentication#auth-in-cockpit) for steps.

## Get Support

In case you've a question, find a bug, or otherwise need support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce) to get more visibility.

## License

Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
