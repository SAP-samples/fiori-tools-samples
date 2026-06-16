# Get Started with SAP Cloud Application Programming Model (CAP) Using SAP Fiori Tools and Managed Approuter with a Hybrid Profile

Build and deploy a CAP Project API with an SAP Fiori elements UI to Cloud Foundry (CF) using a managed approuter configuration hosted on SAP Business Technology Platform (SAP BTP). The project uses an SAP CAP hybrid profile for testing and development. For more information, see [Hybrid Testing](https://cap.cloud.sap/docs/advanced/hybrid-testing).

The CAP project was generated using the `Managed Approuter` configuration as the HTML5 application runtime. For more information, see [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/).

This repository showcases how a CAP project with an SAP Fiori UI is developed and tested using an environment similar to production. The SAP CAP hybrid approach allows you to:

* Work with a HANA HDI database instance.
* Leverage real user authentication.

The benefit of the SAP CAP hybrid approach is you can switch between local mock configuration and cloud service configuration by simply setting or omitting the hybrid profile parameter.

For more information about the local changes required to support a CDS hybrid testing and development environment, see [Changes](changes.md).

## Prerequisites
- You have created an SAP Cloud Platform Trial Account. For more information, see [SAP Business Technology Platform](https://account.hana.ondemand.com/).
- You are subscribed to the SAP Fiori launchpad service. For more information, see [Set Up SAP Build Work Zone, Standard Edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- You have created an [SAP HANA Cloud Service instance](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58) and the service instance is running.
- You have created a [dev workspace](https://help.sap.com/viewer/c2b99f19e9264c4d9ae9221b22f6f589/2021_3_QRC/en-US/f728966223894cc28be3ca2ee60ee784.html) using a `Full Stack Cloud Application`.

## How to Run Locally

1. Git clone the repository: `git clone https://github.com/SAP-samples/fiori-tools-samples.git`.
2. Navigate to the CAP hybrid project: `cd fiori-tools-samples/cap/cap-fiori-hybrid`.
3. Login to your Cloud Foundry environment: `View` -> `Command Palette` -> `CF: Login to Cloud Foundry`.
4. Right-click your CAP project and click `Open in integrated terminal`.
5. Install the required dependencies: `npm run install:app`.
6. Build the CAP project and SAP Fiori application: `npm run build`.
7. Deploy the CAP project and SAP Fiori application: `npm run deploy`.

## How to Run Remotely

1. Update the XSUAA security service: `npm run cf:uaa:update`.

The CAP project is configured with security roles so any local changes must also reflect remotely.

2. Set up the roles for your application. For more information, see [Authentication](https://cap.cloud.sap/docs/node.js/authentication#auth-in-cockpit).

Ensure the security roles defined in the `xs-security.json` file are assigned to your user.

3. Push some data to HANA.

The CAP project was created with samples, edit the `csv` file in the `data` folder and run `npm run deploy:hana`.

You have deployed your application to Cloud Foundry.

4. Bind to the XSUAA service: `cds bind -2 managedAppCAPProject-xsuaa-service --kind xsuaa`.
5. Bind to the HANA HDI service: `cds bind -2 managedAppCAPProject-db`.
6. Run your CAP project in hybrid mode: `npm run watch:hybrid`.

Don't click the `Open in a New Tab` prompt because this does not authenticate with XSUAA security.

The console output displays HANA connectivity as shown in the following example:

```
[cds] - connect using bindings from: { registry: '~/.cds-services.json' }
[cds] - connect to db > hana {
```

To imitate an environment more similar to production, you can route HTTP requests to your SAP BTP XSUAA and HANA services. The `localrouter` fetches a valid token from the XSUAA instance and attaches it to every request.

7. Install the local approuter: `npm run install:localrouter`.
8. Run the local approuter: `cds bind --exec -- npm start --prefix localrouter`.
9. Open your CAP project using the `localrouter:5001` endpoint: `View` -> `Ports: Preview` -> select port 5001.
10. Open the new browser tab and select your SAP Fiori UI application.

## Errors

### Forbidden

You tried to load your SAP Fiori application on port 5001 but received the following error message:
```
Application could not be started due to technical issues.
Forbidden
```

Ensure you have assigned your email address to the `capuser` role in your SAP BTP cockpit. For more information, see [Authentication](https://cap.cloud.sap/docs/node.js/authentication#auth-in-cockpit).

## Help and Support

For help and support, see the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.