# Get Started with SAP Cloud Application Programming Model (CAP) using Fiori tools

For support, chat and samples, please refer to [https://cap.cloud.sap/docs/](https://cap.cloud.sap/docs/)

## Description

The SAP Cloud Application Programming Model (CAP) is a framework of languages, libraries, and tools for building enterprise-grade services and applications. It guides developers along a ‘golden path’ of proven best practices and a great wealth of out-of-the-box solutions to recurring tasks.

This repository provides sample CAP projects using different router configurations and the steps required to deploy to Cloud Foundry;

1. [Managed Approuter](../cap/cap-fiori-mta/README.md) with SAP Hana Cloud service

2. [Standalone Approuter](../cap/cap-fiori-mta-standalone/README.md) with an in-memory database

3. [Managed Approuter with CDS Hybrid Profile](../cap/cap-fiori-hybrid/README.md) supporting HANA and XSUAA services hosted on SAP BTP

4. [Create a SAP BTP Destination exposing CAP services](../cap/destination/README.md), also supports cross subaccount and regions

All CAP projects were generated using the steps outlined in this [blog post](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) selecting the appropiate approuter configuration as the HTML5 application runtime.

### License
Copyright (c) 2009-2023 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
