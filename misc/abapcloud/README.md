# SAP BTP ABAP Environment (Steampunk)

## Overview

This guide covers how to connect to and deploy SAP Fiori applications to an SAP BTP ABAP Environment (Steampunk) system. It covers destination configuration for SAP Business Application Studio, VS Code deployment using the SAP Connection Manager, CI/CD deployment, and troubleshooting connectivity issues.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Connectivity Overview](#connectivity-overview)
3. [Destination Configuration](#destination-configuration)
4. [Troubleshooting](#troubleshooting)
5. [VS Code Deployment Using Connection Manager](#vs-code-deployment-using-connection-manager)
6. [CI/CD Deployment](#cicd-deployment)
7. [Additional Resources](#additional-resources)

## Prerequisites

> **Important**: Ensure any HTML5 application source files you modify are under source control before making changes. Any configuration scripts or commands that change the behavior of your system or operating system must be carried out with the authorization of your IT support team.

- You have an SAP BTP ABAP Environment (Steampunk) instance provisioned.
- You have the required business roles assigned in the ABAP system, such as `SAP_A4C_BC_DEV_UID_PC` for UI deployment.
- You have access to the SAP BTP cockpit with permission to create service keys.
- You are familiar with SAP Fiori application development and deployment concepts.

## Connectivity Overview

SAP Business Application Studio connects to ABAP Cloud systems using SAP BTP destinations configured with `WebIDEUsage=odata_abap`. The typical flow is SAP Business Application Studio connects to a destination, which connects to the ABAP Environment using SAP BTP. With `odata_abap`, the destination URL must always be the base host. SAP Business Application Studio appends the ABAP catalog paths automatically.

Before connecting, ensure you are logged in to Cloud Foundry and the correct organization and space are set. This is required for SAP Business Application Studio to resolve destinations and deploy applications correctly.

## Destination Configuration

The destination must point to the ABAP system root URL with no service path appended. The key required properties include:

- `WebIDEUsage`: `odata_abap,dev_abap,abap_cloud`
- `WebIDEEnabled`: `true`
- `HTML5.DynamicDestination`: `true`
- The `Authentication` type, which can be configured as `OAuth2UserTokenExchange` or `SAMLAssertion` depending on the scenario:
  - Same subaccount: `OAuth2UserTokenExchange`
  - Cross-subaccount: `SAMLAssertion`

When exposing an SAP BTP ABAP Environment (Steampunk) system to the internet using an SAP BTP destination, ensure the destination `WebIDEUsage` field contains the following values:

```text
WebIDEUsage: odata_abap,dev_abap,abap_cloud
```

The `abap_cloud` property is used to determine which type of system is connected.

The following is an example of an `OAuth2UserTokenExchange` destination for an ABAP Cloud system in a same-subaccount scenario:

```json
{
    "Authentication": "OAuth2UserTokenExchange",
    "HTML5.DynamicDestination": "true",
    "HTML5.SetXForwardedHeaders": "false",
    "HTML5.Timeout": "180000",
    "Name": "<destination-name>",
    "ProxyType": "Internet",
    "Type": "HTTP",
    "URL": "https://<abap-system-guid>.abap.<region>.ondemand.com",
    "WebIDEEnabled": "true",
    "WebIDEUsage": "odata_abap,dev_abap,abap_cloud",
    "abap_enabled": "true",
    "clientId": "<client-id>",
    "clientSecret": "<client-secret>",
    "tokenServiceURL": "https://<subdomain>.authentication.<region>.hana.ondemand.com/oauth/token",
    "tokenServiceURLType": "Dedicated"
}
```

> **Note**: The `clientId`, `clientSecret`, and `tokenServiceURL` values are obtained from the service key of your ABAP Environment instance. To generate a service key, open the SAP BTP cockpit, navigate to your ABAP Environment service instance, and create a new service key. The `clientId` and `clientSecret` are available in the service key JSON under the `uaa` object. The `tokenServiceURL` is the `uaa.url` value with `/oauth/token` appended.
>
> **Note**: `OAuth2UserTokenExchange` exchanges an existing user access token for a new token scoped to a target service, which preserves the user context within OAuth flows. `SAMLAssertion` uses a signed XML assertion from an identity provider to authenticate the user and establish trust, typically in cross-system or federated SSO scenarios. Both types can be used within the same subaccount.

Alternatively, `SAMLAssertion` can be used for both same-subaccount and cross-subaccount scenarios. See the following example:

```json
{
    "Authentication": "SAMLAssertion",
    "Description": "<destination-description>",
    "HTML5.DynamicDestination": "true",
    "HTML5.Timeout": "60000",
    "Name": "<destination-name>",
    "ProxyType": "Internet",
    "Type": "HTTP",
    "URL": "https://<abap-system-guid>.abap.<region>.ondemand.com",
    "WebIDEEnabled": "true",
    "WebIDEUsage": "odata_abap,dev_abap,abap_cloud",
    "audience": "https://<abap-system-guid>.abap-web.<region>.ondemand.com",
    "authnContextClassRef": "urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession",
    "nameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
}
```

Use the following values for the `URL` and `audience` fields:

- For the `URL` field, copy the `Host Name` from the Communication Systems app, for example, `https://<abap-system-guid>.abap.<region>.ondemand.com`.
- For the `audience` field, use the same host name with `-web` appended before the region, for example, `https://<abap-system-guid>.abap-web.<region>.ondemand.com`.

To confirm the correct values, log in to your ABAP Cloud environment, open the **Communication Systems** app, and select your SAP Cloud System. You can identify it by the **This is your own SAP Cloud System** label. The `Host Name` field contains the correct value for the `URL` field, and the `OAuth 2.0 SAML2 Audience` field contains the exact value for the `audience` field. For cross-subaccount scenarios, you must also configure a system-to-system trust on the target ABAP system so that it accepts SAML assertions issued by the source subaccount. For more information, see [Cross-Subaccount Requirements](#cross-subaccount-requirements).

### Cross-Subaccount Requirements

When SAP Business Application Studio (Subaccount B) accesses an ABAP system (Subaccount A), both subaccounts must be under the same global account and trust must be established between them. The identity provider and trust configuration must be aligned so that tokens issued in Subaccount B are accepted by Subaccount A.

The SAML trust must be explicitly established between the two subaccounts. This requires exporting the signing certificate from Subaccount B, which acts as the identity provider, and importing it into Subaccount A within the ABAP Cloud system.

In the ABAP environment, this is configured using the Communication Systems application, where the certificate is uploaded and assigned to the relevant communication system. This ensures that SAML assertions issued by Subaccount B can be validated and trusted by Subaccount A during authentication.

### Roles and Authorizations

The developer user must have the required business roles and catalogs assigned in the ABAP system. For example, the `SAP_A4C_BC_DEV_UID_PC` role is required for UI deployment. Missing roles typically result in HTTP 401, which indicates an authorization failure, and HTTP 500, which indicates a back-end configuration issue.

### Service Discovery

SAP Business Application Studio uses OData catalog services to discover back-end services. With `odata_abap`, both OData V2 and OData V4 catalog endpoints must be accessible from the destination:

- OData V2: `/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection`
- OData V4: `/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/0002/ServiceGroups?$expand=DefaultSystem($expand=Services)`

An empty catalog or connection failure typically indicates a destination misconfiguration, authentication failure, or a missing service exposure in the ABAP communication scenario.

### Common Failure Patterns

| HTTP Status | Likely Cause |
|---|---|
| HTTP 401 | Missing roles, invalid authentication setup, or SAML trust not configured |
| HTTP 500 | Back-end misconfiguration, missing service exposure, or invalid destination setup |
| Empty catalog | Service not exposed in ABAP or communication scenario not configured |

## Troubleshooting

One of the most common reasons why the connection fails when accessing the ABAP Cloud environment from an external application, such as SAP Business Application Studio, is that the communication system is not set up correctly.

When creating the Communication Arrangement, use the Communication Scenario `SAP_COM_0510` (UI Development Tools for ABAP). This scenario exposes the BSP and SICF APIs required for SAP Fiori application deployment.

For more information, see [Creating a Communication System for SAP Business Application Studio](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/creating-communication-system-for-sap-business-application-studio).

### Validating Connectivity Using Environment Check

Use the Environment Check tool in SAP Business Application Studio to validate your destination properties and confirm connectivity. For more information, see the [Environment Check](../destinations/README.md#environment-check) section in the destinations guide.

### Enabling a Connectivity Trace

If you are still facing issues after reviewing the Environment Check report, enable a connectivity trace in your ABAP Cloud system and analyze the error. For more information, see [Enable a Connectivity Trace](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/display-connectivity-trace).

## VS Code Deployment Using Connection Manager

When deploying from VS Code, you can use the [SAP UX Tools - SAP Systems](https://marketplace.visualstudio.com/items?itemName=SAPOSS.sap-ux-sap-systems-ext) extension (SAP Connection Manager) to connect directly to your ABAP Cloud system. This extension is specific to VS Code and is independent of SAP BTP destinations, which are used for SAP Business Application Studio connectivity. Authentication uses reentrance tickets, which the extension handles automatically.

Install the extension from the VS Code Marketplace, then add your ABAP Cloud system using the system URL and your credentials. Once added, the system is available for deployment using the SAP Fiori tools `deploy` command or the guided deployment wizard in VS Code.

To use reentrance ticket authentication, set `authenticationType: reentranceTicket` in the `target` section of your `ui5-deploy.yaml` file:

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "4.0"
metadata:
  name: <app-name>
type: application
builder:
  resources:
    excludes:
      - /test/**
      - /localService/**
  customTasks:
    - name: deploy-to-abap
      afterTask: generateCachebusterInfo
      configuration:
        verbose: true
        target:
          url: https://<abap-system-guid>.abap.<region>.ondemand.com
          authenticationType: reentranceTicket
        app:
          name: <BSP_APP_NAME>
          package: <ABAP_PACKAGE>
          transport: <TRANSPORT_REQUEST>
        exclude:
          - /test/
          - /localService/
```

You can also deploy and undeploy directly from the terminal. The SAP Fiori tools CLI uses the SAP Connection Manager to authenticate and connect to your ABAP Cloud system:

```bash
npm run deploy
npm run undeploy
```

## CI/CD Deployment

Before running a CI/CD deployment, create a service key on your ABAP Environment service instance in the SAP BTP cockpit. The `uaa.clientid`, `uaa.clientsecret`, and `uaa.url` values from the service key JSON map to the `--uaa-clientid`, `--uaa-clientsecret`, and `--uaa-url` parameters respectively.

To deploy from a CI/CD pipeline without a `ui5-deploy.yaml` configuration file, use the `--noConfig` flag and pass all required parameters directly on the command line:

```bash
npx fiori deploy \
  --url 'https://<abap-system-guid>.abap.<region>.ondemand.com' \
  --name '<app-name>' \
  --package '<abap-package>' \
  --transport '<transport-request>' \
  --archive-path 'archive.zip' \
  --uaa-url 'https://<subdomain>.authentication.<region>.hana.ondemand.com' \
  --uaa-username '<username>' \
  --uaa-password '<password>' \
  --uaa-clientid '<uaa-client-id>' \
  --uaa-clientsecret '<uaa-client-secret>' \
  --noConfig \
  --yes \
  --verbose \
  --failfast
```

To undeploy an application, use the same approach with `npx fiori undeploy`. The `--package` and `--archive-path` parameters are not required for undeployment:

```bash
npx fiori undeploy \
  --url 'https://<abap-system-guid>.abap.<region>.ondemand.com' \
  --name '<app-name>' \
  --transport '<transport-request>' \
  --uaa-url 'https://<subdomain>.authentication.<region>.hana.ondemand.com' \
  --uaa-username '<username>' \
  --uaa-password '<password>' \
  --uaa-clientid '<uaa-client-id>' \
  --uaa-clientsecret '<uaa-client-secret>' \
  --noConfig \
  --yes \
  --verbose \
  --failfast
```

> **Note**: If a `ui5-deploy.yaml` configuration file is present, you can omit `--noConfig` and the `--name`, `--package`, and `--transport` parameters. The command reads those values from the configuration file automatically.
>
> **Note**: Values that contain special characters such as `!`, `/`, `+`, or `=`, which are common in UAA client IDs and secrets, must be quoted. In bash, use single quotes (`'value'`) to prevent the shell from interpreting these characters.

For more information about CI/CD deployment configuration, which includes common errors such as MFA enforcement, see the [CI/CD README](../cicd/README.md).

### Validating Credentials with a Third-Party Tool

To test the OAuth2 password grant type independently of SAP Fiori tools, use a third-party tool such as Postman. Use this approach to confirm that the UAA credentials and ABAP system URL are correct before running a deployment.

Send a `POST` request to the UAA token endpoint with the following parameters:

- **URL**: `https://<subdomain>.authentication.<region>.hana.ondemand.com/oauth/token`
- **Grant type**: `password`
- **Client ID**: `uaa.clientid` from your service key
- **Client secret**: `uaa.clientsecret` from your service key
- **Username**: your SAP BTP user
- **Password**: your SAP BTP password

A successful response returns an access token, which confirms that authentication is working independently of SAP Fiori tools.

## Additional Resources

- [Demystifying: SAP BTP - ABAP Environment, Steampunk, ABAP on Cloud, Embedded Steampunk](https://community.sap.com/t5/technology-blog-posts-by-members/demystifying-sap-btp-abap-environment-steampunk-abap-on-cloud-embedded/ba-p/13567772)
- [Create an SAP Fiori App and Deploy it to SAP BTP, ABAP Environment](https://developers.sap.com/tutorials/abap-environment-deploy-fiori-elements-ui.html)
- [Configuring BTP Cross-Account and Cross-Region Destinations for Use in UI Tooling](https://www.youtube.com/watch?v=8ePyQJsmWYA)
- [Creating a Destination for Cross-Subaccount Communication](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-destination-for-cross-subaccount-communication)

> **Note**: Some content from the Configuring BTP Cross-Account and Cross-Region Destinations video is outdated, for example, the legacy SAP BTP Destinations flow and where to find the trust (`*.pem` file) certificates. However, the video is still relevant for the cross-account and cross-region destination configuration.

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
