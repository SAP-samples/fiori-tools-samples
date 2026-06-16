# SAP BTP ABAP Environment (Steampunk)

## Prerequisites

> **Important**: Ensure any HTML5 application source files you modify are under source control before making changes. Any configuration scripts or commands that change the behavior of your system or operating system must be carried out with the authorization of your IT support team.

- The `Authentication` type can be configured with different options, which include `OAuth2UserTokenExchange` and `SAMLAssertion`.
- When exposing an SAP BTP ABAP Environment (Steampunk) system to the internet using an SAP BTP destination, ensure the destination `WebIDEUsage` field contains the following values:

```text
WebIDEUsage: odata_abap,dev_abap,abap_cloud
```

The `abap_cloud` property is used to determine which type of system is connected.

## Useful Links

For more information about understanding the ABAP Cloud Environment (Steampunk), see [Demystifying: SAP BTP - ABAP Environment, Steampunk, ABAP on Cloud, Embedded Steampunk](https://community.sap.com/t5/technology-blog-posts-by-members/demystifying-sap-btp-abap-environment-steampunk-abap-on-cloud-embedded/ba-p/13567772).

For more information about creating an SAP Fiori app and deploying it to SAP BTP, ABAP Cloud Environment, see [Create an SAP Fiori App and Deploy it to SAP BTP, ABAP Environment](https://developers.sap.com/tutorials/abap-environment-deploy-fiori-elements-ui.html).

For more information about enabling an SAP BTP destination for usage across global accounts or between different regions using `SAMLAssertion`, see [Configuring BTP Cross-Account and Cross-Region Destinations for Use in UI Tooling](https://www.youtube.com/watch?v=8ePyQJsmWYA) and [Creating a Destination for Cross-Subaccount Communication](https://help.sap.com/docs/btp/sap-business-technology-platform/creating-destination-for-cross-subaccount-communication).

Note that some of the content from Configuring BTP Cross-Account and Cross-Region Destinations for Use in UI Tooling is outdated. For example, the legacy SAP BTP Destinations flow and where to find the trust (`*.pem` file) certificates. However, the video is still relevant for the cross-account and cross-region destination configuration.

## Connectivity Overview

SAP Business Application Studio connects to ABAP Cloud systems using SAP BTP destinations configured with `WebIDEUsage=odata_abap`. The typical flow is SAP Business Application Studio connects to a destination, which connects to the ABAP Environment using SAP BTP. With `odata_abap`, the destination URL must always be the base host. SAP Business Application Studios appends the ABAP catalog paths automatically.

Before connecting, ensure you are logged in to Cloud Foundry and the correct organization and space are set. This is required for SAP Business Application Studio to resolve destinations and deploy applications correctly.

## Destination Configuration

The destination must point to the ABAP system root URL with no service path appended. The key required properties include:

- `WebIDEUsage`: `odata_abap,dev_abap,abap_cloud`
- `WebIDEEnabled`: `true`
- `HTML5.DynamicDestination`: `true`
- Correct root URL with no service path appended
- Proper authentication type based on the scenario:
  - Same subaccount: `OAuth2UserTokenExchange`
  - Cross-subaccount: `SAMLAssertion`

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

> **Note**: `OAuth2UserTokenExchange` exchanges an existing user access token for a new token scoped to a target service, which preserve the user context within OAuth flows. `SAMLAssertion` uses a signed XML assertion from an identity provider to authenticate the user and establish trust, typically in cross-system or federated SSO scenarios. Both types can be used within the same subaccount.

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

- For the `URL` field, copy the `Host Name` from the Communication Systems app, for example, `https://<abap-system-guid>.abap.<region>.ondemand.com`.

- For the `audience` field, use the same host name with `-web` appended before the region, for example, `https://<abap-system-guid>.abap-web.<region>.ondemand.com`.

To confirm the correct values, log in to your ABAP Cloud environment, open the **Communication Systems** app, and select your SAP Cloud System. You can identify it by the **This is your own SAP Cloud System** label. The `Host Name` field contains the correct value for the `URL` field, and the `OAuth 2.0 SAML2 Audience` field contains the exact value for the `audience` field. For cross-subaccount scenarios, you must also configure a system-to-system trust on the target ABAP system so that it accepts SAML assertions issued by the source subaccount. For more information, see the [Cross-Subaccount Requirements](#cross-subaccount-requirements) section.

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

For more information, see [Creating a Communication System for SAP Business Application Studio](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/creating-communication-system-for-sap-business-application-studio).

## Validating Connectivity Using Environment Check

Use the Environment Check tool in SAP Business Application Studio to validate your destination properties and confirm connectivity. For more information, see the [Environment Check](../destinations/README.md#environment-check) section in the destinations guide.

## Enabling a Connectivity Trace

If you are still facing issues after reviewing the Environment Check report, enable a connectivity trace in your ABAP Cloud system and analyze the error. For more information, see [Enable a Connectivity Trace](https://help.sap.com/docs/sap-btp-abap-environment/abap-environment/display-connectivity-trace).

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
