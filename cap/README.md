# Get Started with SAP Cloud Application Programming Model (CAP) Using SAP Fiori Tools

## Description

The SAP Cloud Application Programming Model (CAP) is a framework of languages, libraries, and tools for building enterprise-grade services and applications. It guides developers along a golden path of proven best practices and an out-of-the-box solutions to recurring tasks.

This repository provides sample CAP projects using different router configurations and the steps required to deploy to Cloud Foundry:

- [Managed Approuter](../cap/cap-fiori-mta/README.md) with SAP HANA Cloud service

- [Standalone Approuter](../cap/cap-fiori-mta-standalone/README.md) with an in-memory database

- [Managed Approuter with CDS Hybrid Profile](../cap/cap-fiori-hybrid/README.md) which supports HANA and XSUAA services hosted on SAP BTP

- [Create an SAP BTP Destination exposing CAP services](../cap/destination/README.md), which also supports cross subaccount and regions

All CAP projects were generated using the steps outlined in this [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) blog post and selected the appropriate router configuration as the HTML5 application runtime.

## Additional Notes

For more information about support, chat, and samples, see [SAP Cloud Application Programming Model](https://cap.cloud.sap/docs/).

For more information about integrating CI/CD into your CAP deployment strategy, see [Continuous Integration and Delivery](https://www.youtube.com/watch?v=gvWSHSZFPok).

## License
Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
