# SAP BTP ABAP Environment (Steampunk)

## Prerequisites

> **Important**: Ensure any HTML5 application source files you modify are under source control before making changes. Any configuration scripts or commands that change the behaviour of your system or operating system should be carried out with the authorization of your IT support team.

- The `Authentication` type can be configured with different options, including `OAuth2UserTokenExchange` and `SAMLAssertion`.
- When exposing an SAP BTP ABAP Environment (Steampunk) system to the internet using an SAP BTP destination, ensure the destination `WebIDEUsage` field contains the following values:

```text
WebIDEUsage: odata_abap,dev_abap,abap_cloud
```

The `abap_cloud` property is used to determine which type of system is being connected to.

## Understanding ABAP Cloud Environment (Steampunk)

Follow this blog post to [Demystifying: SAP BTP - ABAP Environment, Steampunk, ABAP on Cloud, Embedded Steampunk](https://community.sap.com/t5/technology-blog-posts-by-members/demystifying-sap-btp-abap-environment-steampunk-abap-on-cloud-embedded/ba-p/13567772).

## Creating an SAP Fiori App and Deploying It to SAP BTP, ABAP Cloud Environment

Follow this tutorial to [Create an SAP Fiori App and Deploy it to SAP BTP, ABAP Environment](https://developers.sap.com/tutorials/abap-environment-deploy-fiori-elements-ui.html).

## Enable a BTP Destination for Usage Across Global Accounts or Between Different Regions Using SAMLAssertion

Option 1: Watch [Configuring BTP Cross-Account and Cross-Region Destinations For Use in UI Tooling](https://www.youtube.com/watch?v=8ePyQJsmWYA).

Note that some of the content is outdated. For example, the legacy SAP BTP Destinations flow or where to find the trust (*.pem file) certificates. However, the video is still relevant for the cross-account and cross-region destination configuration.

Option 2: Read [Creating a Destination for Cross-Subaccount Communication](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-destination-for-cross-subaccount-communication)

### Key Notes from the Tutorial

#### Connectivity overview

SAP Business Application Studio connects to ABAP Cloud systems using BTP destinations configured with `WebIDEUsage=odata_abap`. The typical flow is: BAS connects to a destination, which connects to the ABAP Environment using BTP. With `odata_abap`, the destination URL must always be the base host only — BAS appends the ABAP catalog paths automatically.

Before connecting, ensure BAS is logged in to Cloud Foundry and the correct organization and space are set. This is required for BAS to resolve destinations and deploy applications correctly.

#### Destination configuration

The destination must point to the ABAP system root URL with no service path appended. Key required properties include:

- `WebIDEUsage`: `odata_abap,dev_abap,abap_cloud`
- `WebIDEEnabled`: `true`
- `HTML5.DynamicDestination`: `true`
- Correct root URL with no service path appended
- Proper authentication type based on the scenario:
  - Same subaccount: `OAuth2UserTokenExchange`
  - Cross-subaccount: `SAMLAssertion`

The following is an example of an `OAuth2UserTokenExchange` destination for an ABAP Cloud system (same-subaccount scenario):

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

> **Note**: `OAuth2UserTokenExchange` exchanges an existing user access token for a new token scoped to a target service, preserving user context within OAuth flows. `SAMLAssertion` uses a signed XML assertion from an identity provider to authenticate the user and establish trust, typically in cross-system or federated SSO scenarios. Both types can be used within the same subaccount.

Alternatively, `SAMLAssertion` can also be used for same-subaccount scenarios. The following is an example:

```json
{
    "Authentication": "SAMLAssertion",
    "Description": "<destination-description>",
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
    "audience": "https://<abap-system-guid>.abap-web.<region>.ondemand.com",
    "authnContextClassRef": "urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession",
    "nameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    "includeSigningCertificateInSAMLAssertion": "false",
    "skipUserAttributesPrefixInSAMLAttributes": "false",
    "skipUserUuidInSAMLAttributes": "false"
}
```

The following is an example of a `SAMLAssertion` destination for a cross-subaccount scenario:

> **Note**: To support cross-subaccount communication, a system-to-system trust must be configured on the target ABAP system. This allows SAML assertions issued by the source subaccount to be accepted by the target system. For more information, see the [Cross-subaccount requirements](#cross-subaccount-requirements) section below.

```json
{
    "Authentication": "SAMLAssertion",
    "Description": "<destination-description>",
    "HTML5.DynamicDestination": "true",
    "HTML5.Timeout": "60000",
    "Name": "<destination-name>",
    "ProxyType": "Internet",
    "Type": "HTTP",
    "URL": "https://<system-id>-api.<region>.ondemand.com",
    "WebIDEEnabled": "true",
    "WebIDEUsage": "odata_abap,dev_abap,abap_cloud",
    "audience": "https://<system-id>.<region>.ondemand.com",
    "authnContextClassRef": "urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession",
    "nameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
}
```

#### Cross-subaccount requirements

When BAS (Subaccount B) accesses an ABAP system (Subaccount A), both subaccounts must be under the same global account and trust must be established between them. The identity provider and trust configuration must be aligned so that tokens issued in Subaccount B are accepted by Subaccount A.

The SAML trust must be explicitly established between the two subaccounts. This requires exporting the signing certificate from Subaccount B (the identity provider context) and importing it into Subaccount A within the ABAP Cloud system.

In the ABAP environment, this is configured using the Communication Systems application, where the certificate is uploaded and assigned to the relevant communication system. This ensures that SAML assertions issued by Subaccount B can be validated and trusted by Subaccount A during authentication.

#### Roles and authorizations

The developer user must have the required business roles and catalogs assigned in the ABAP system. For example, the `SAP_A4C_BC_DEV_UID_PC` role is required for UI deployment. Missing roles typically result in HTTP 401 (authorization failure) or HTTP 500 (back-end configuration issue) errors.

#### Service discovery

BAS uses OData catalog services to discover back-end services. With `odata_abap`, both V2 and V4 catalog endpoints must be accessible from the destination:

- V2: `/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection`
- V4: `/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/0002/ServiceGroups?$expand=DefaultSystem($expand=Services)`

An empty catalog or connection failure typically indicates a destination misconfiguration, authentication failure, or a missing service exposure in the ABAP communication scenario.

#### Common failure patterns

| HTTP Status | Likely Cause |
|---|---|
| HTTP 401 | Missing roles, invalid authentication setup, or SAML trust not configured |
| HTTP 500 | Back-end misconfiguration, missing service exposure, or invalid destination setup |
| Empty catalog | Service not exposed in ABAP or communication scenario not configured |

## Troubleshooting

One of the most common reasons why the connection fails when accessing the ABAP Cloud environment from an external application, such as Business Application Studio, is that the communication system is not set up correctly.

For more information, see [Creating a Communication System for SAP Business Application Studio](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/creating-communication-system-for-sap-business-application-studio).

### Validating Connectivity Using Environment Check

Use the Environment Check tool in BAS to validate your destination properties and confirm connectivity. For more information, see the [Environment Check](../destinations/README.md#environment-check) section in the destinations guide.

### Enabling a Connectivity Trace

If you are still blocked after reviewing the Environment Check report, enable a connectivity trace in your ABAP Cloud system and analyze the error. For more information, see [Enable a Connectivity Trace](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/display-connectivity-trace).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
