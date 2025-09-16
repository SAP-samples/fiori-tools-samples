# ABAP Cloud Environment (Steampunk)


# Prerequisites
- The `Authentication` type can be configured with different options, including `OAuth2UserTokenExchange` or `SAMLAssertion`.
- When exposing an ABAP Cloud system to the internet using a SAP BTP destination, ensure the destination `WebIDEUsage` field contains the following values, the `abap_cloud` property is used to determine which type of system is being connected to.
```
WebIDEUsage: odata_abap,dev_abap,abap_cloud
```

## Understanding ABAP Cloud Environment (Steampunk)

Follow this blog post to [Demystifying: SAP BTP - ABAP Environment, Steampunk, ABAP on Cloud, Embedded Steampunk](https://community.sap.com/t5/technology-blog-posts-by-members/demystifying-sap-btp-abap-environment-steampunk-abap-on-cloud-embedded/ba-p/13567772).

## Creating a SAP Fiori App and Deploy it to SAP BTP, ABAP Cloud Environment

Follow this tutorial to [Create an SAP Fiori App and Deploy it to SAP BTP, ABAP Environment](https://developers.sap.com/tutorials/abap-environment-deploy-fiori-elements-ui.html).

## Enable a BTP Destination for Usage Across Global Accounts or Between Different Regions Using SAMLAssertion

Option 1: Watch [Configuring BTP Cross-Account and Cross-Region Destinations For Use in UI Tooling](https://www.youtube.com/watch?v=8ePyQJsmWYA).

Please note some of the content is outdated. For example, the legacy SAP BTP Destinations flow or where to find the trust (*.pem file) certificates. However, the video is still relevant for the cross-account and cross-region destination configuration.

Option 2: Read [Creating a Destination for Cross-Subaccount Communication](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-destination-for-cross-subaccount-communication)

# Troubleshooting

One of the most common reasons why the connection fails when accessing the ABAP Cloud environment from an external application, such as Business Application Studio, is that the communication system is not set up correctly.

For more information, see [Creating a Communication System for SAP Business Application Studio](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/creating-communication-system-for-sap-business-application-studio).

If you are still blocked from accessing your ABAP Cloud instance, enable a connectivity trace in your ABAP Cloud system and analyze the error. For more information, see [Enable a Connectivity Trace](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/display-connectivity-trace).

### License
Copyright (c) 2009-2025 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.

