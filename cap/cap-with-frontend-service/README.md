# Get Started with SAP Cloud Application Programming Model (CAP) using Fiori Tools and Application Frontend Service

Build and deploy a CAP project with a Fiori Elements UI hosted on SAP Business Technology Platform (BTP) using Application Frontend Service.

This sample was generated using `cds init`, `cds add` plugins, and the Fiori tools generators. Application Frontend Service replaces the managed approuter as the HTML5 application runtime.

## Project Generation

The base CAP project was generated using the following commands:

```shell
cds init cap-with-frontend-service && \
cd cap-with-frontend-service && \
cds add nodejs && \
npm install && \
cds add tiny-sample && \
cds add hana && \
cds add mta && \
cds add xsuaa && \
cds add connectivity && \
cds add destination && \
cds add app-frontend && \
cds add html5-repo && \
cds build --for hana && \
cp gen/db/package.json db && \
npm update --package-lock-only
```

The Fiori Elements UI was then added using the SAP Fiori tools App Generator (List Report Page V4, Local CAP service).

## Resources

- SAP Help Portal: [What Is Application Frontend Service](https://help.sap.com/docs/application-frontend-service/application-frontend-service/what-is-application-frontend-service?version=Cloud)
- Blog Post: [Introducing Application Frontend Service](https://community.sap.com/t5/technology-blog-posts-by-sap/introducing-application-frontend-service/ba-p/14091408)
- Blog Post: [Simple UI Applications with Application Frontend Service](https://community.sap.com/t5/technology-blog-posts-by-sap/simple-ui-applications-with-application-frontend-service/ba-p/14096009)
- Blog Post: [Exploring Application Frontend Service: Deploying the UI of an MTA App](https://community.sap.com/t5/technology-blog-posts-by-members/exploring-application-frontend-service-deploying-the-ui-of-an-mta-app/ba-p/14149899)

## Prerequisites

These are required for deploying to Cloud Foundry (CF):

- An [SAP BTP trial account](https://account.hana.ondemand.com/)
- An [SAP HANA Cloud Service instance](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58) or an existing one
- CF CLI installed and logged in to your target org and space

> **Note:** Application Frontend Service is available on `cf-us10` for SAP BTP trial accounts.

### Enable Application Frontend Service

Follow these steps in your SAP BTP subaccount before deploying:

1. In your subaccount, go to **Instances and Subscriptions** and subscribe to **SAP Cloud Identity Services**.
2. Enable **SAP Identity Authentication Service (IAS)** and configure **Trust and Authorization** using the enabled SAP IAS tenant.
3. Go to **Entitlements** and add the **Application Frontend Service** entitlement.
4. Enable both the **Developer** and **Application** service plans.
5. Create a **Role Collection** with the required Application Frontend Service roles and assign it to your user (using your SAP IAS identity).

### SAP Business Application Studio

- Create a [dev workspace](https://help.sap.com/viewer/c2b99f19e9264c4d9ae9221b22f6f589/2021_3_QRC/en-US/f728966223894cc28be3ca2ee60ee784.html) using a `Full Stack Cloud Application` template

## Setup and Run Locally

- Open a terminal and run `npm ci`
- Bind to your [HANA Cloud Service instance](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html)
- Run `cds watch` to build and start the application
- Select `Open in New Tab` when prompted
- Select your Fiori application or the `Books` service endpoint

## Build and Deploy to CF

**Option 1: Using the CLI**

```shell
npm run build && npm run deploy
```

**Option 2: Using SAP Business Application Studio**

- Right-click `mta.yaml` and select `Build MTA Project`
- Right-click `mta_archives/archive.mtar` and select `Deploy MTA Archive`

Both options prompt for CF credentials if you are not already logged in.

## Verify Deployment

After deployment, open your SAP BTP subaccount, navigate to `HTML5 Applications` in the left panel, and select your Fiori application.

## Undeploy

To remove the deployed application and all associated services, run:

```shell
npm run undeploy
```

## Get Support

For questions, bugs, or other support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
