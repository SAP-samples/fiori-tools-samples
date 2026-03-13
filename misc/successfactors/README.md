# OAuth2SAMLBearerAssertion Destination Configured to Point to SAP SuccessFactors

## Overview

This guide covers how to configure an SAP BTP destination using `OAuth2SAMLBearerAssertion` authentication to connect to SAP SuccessFactors, and how to consume that destination correctly in your application.

For general guidance on SAP BTP destinations, including how to consume and validate them, see the [Destinations guide](../destinations/README.md).

> **Note**: This guide is scoped to `OAuth2SAMLBearerAssertion` destination configuration only. It does not cover issues related to OpenID Connect (OIDC), SAP Cloud Identity Services (IAS), or any other third-party identity providers. If your issue involves trust configuration with an external IdP, see the relevant identity provider documentation.

## Prerequisites

- You have administrative access to your SAP BTP subaccount.
- You have administrative access to your SAP SuccessFactors instance (Admin Center).
- You have reviewed the SAP BTP [Create and Consume Destination for Cloud Foundry Application](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/create-and-consume-destination-for-cloud-foundry-application) documentation.

## Troubleshooting: 500 Internal Server Error

A `500 Internal Server Error` can occur when:

- The destination is sending information that SuccessFactors is not able to process or is not prepared to handle.
- The call to consume the destination is incorrectly implemented.

### Proposed Solution

#### Step 1: Simplify Additional Properties

Maintain only the following additional property in the destination:

- `apiKey` = the API Key of the OAuth client you created in SuccessFactors.

Remove any other additional properties that are not required, as unexpected values can cause SuccessFactors to reject the request.

#### Step 2: Verify Destination Consumption

Review whether you are correctly calling the destination. See steps **2** and **3** from [Create and Consume Destination for Cloud Foundry Application](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/create-and-consume-destination-for-cloud-foundry-application#consume-the-destination-and-execute-the-scenario).

## Full Configuration from Scratch

If the proposed solution does not resolve the issue, re-establish the complete trust between SAP SuccessFactors and SAP BTP from scratch. Follow each step and capture a screenshot at each stage to verify correctness.

### Step 1: Download the Destination Certificate from SAP BTP

1. Open your SAP BTP subaccount.
2. Navigate to **Connectivity** > **Destinations**.
3. Click **Download Trust** to download the destination's certificate.

### Step 2: Register the OAuth Client in SAP SuccessFactors

1. Open the SAP SuccessFactors **Admin Center**.
2. Search for **OAuth** and select **Manage OAuth2 Client Applications**.
3. Click **Register Client Application** and fill in the following fields:

   | Field | Value |
   | --- | --- |
   | Application Name | A descriptive name to identify which BTP subaccount this corresponds to. |
   | Application URL | The exact Cloud Foundry API Endpoint for your subaccount followed by the Subaccount ID. For example, if your API Endpoint is `us10-001`, the URL is: `https://api.cf.us10-001.hana.ondemand.com/2ad7b189-4d46-4104-a733-5c0b01ae066f` |
   | X.509 Certificate | Copy only the content between `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` from the downloaded trust certificate. |

   > **Note**: To find your API Endpoint and Subaccount ID, open the SAP BTP Cockpit, navigate to the **Overview** tab of your subaccount, and check the **Cloud Foundry Environment** section.

4. Click **Register**.
5. Copy the generated **API Key** — you will need it in the next step.

### Step 3: Create the SAP BTP Destination

1. Open your SAP BTP subaccount.
2. Navigate to **Connectivity** > **Destinations** > **New Destination**.
3. Configure the destination with the following properties:

   | Property | Value |
   | --- | --- |
   | Type | `HTTP` |
   | URL | `https://api4.successfactors.com/` (see note below about regional URLs) |
   | Proxy Type | `Internet` |
   | Authentication | `OAuth2SAMLBearerAssertion` |
   | Audience | `www.successfactors.com` |
   | AuthnContextClassRef | `urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession` |
   | Client Key | The API Key copied from step 2.5 (the OAuth client created in SuccessFactors). |
   | Token Service URL | `https://api4.successfactors.com/oauth/token` |
   | Token Service URL Type | `Dedicated` |
   | Key Store Location | The `.p12` certificate file downloaded from SAP BTP (for example, `mysubaccount.p12`). |
   | Key Store Password | The password for the `.p12` certificate file. |

   > **Note**: The SuccessFactors API hostname varies by data centre. For example, `api4.successfactors.com` is used for some regions while others use `api-in10.hr.cloud.sap` or similar. Check your SuccessFactors tenant URL to identify the correct hostname.

4. Add the following **Additional Properties**:

   | Key | Value |
   | --- | --- |
   | `apiKey` | The API Key of the OAuth client created in SuccessFactors (step 2.5). |
   | `audience` | `www.successfactors.com` |
   | `authnContextClassRef` | `urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession` |
   | `clientKey` | The API Key of the OAuth client created in SuccessFactors (step 2.5). |
   | `companyId` | Your SuccessFactors company ID. |
   | `nameIdFormat` | See [NameID Format](#nameid-format) below. |
   | `tokenServiceURL` | `https://api4.successfactors.com/oauth/token` |
   | `tokenServiceURLType` | `Dedicated` |
   | `XFSystemName` | Your SuccessFactors system name or company ID. |
   | `WebIDEEnabled` | `true` |
   | `WebIDEUsage` | `odata_gen` |
   | `HTML5.DynamicDestination` | `true` |
   | `product.name` | `SAP SuccessFactors` |

#### NameID Format

The `nameIdFormat` property controls which user identifier is propagated in the SAML assertion:

| Value | Description |
| --- | --- |
| `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` | Propagates the **User ID**. |
| `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` | Propagates the **User Email**. |

Use `unspecified` if you want the user ID to be propagated (the most common case).

### Step 4: Consume the Destination in Your Application

Once the trusted connection is established between SuccessFactors and the SAP BTP destination, your application must consume it correctly. Use one of the following approaches:

#### Option 1: Destination Service REST API

1. Execute a `find destination` request from your source application to the Destination service. For details, see [Consuming the Destination Service](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/consuming-destination-service).
2. Use the **automated token retrieval** functionality provided by the `find destination` REST API. This handles the OAuth2 SAML bearer token exchange on your behalf. For the full API reference, see [Find a Destination](https://api.sap.com/api/SAP_CP_CF_Connectivity_Destination/resource/Find_a_Destination).
3. Use the returned [Find Destination response structure](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/find-destination-response-structure) to construct your authenticated requests to SuccessFactors.

#### Option 2: Application Router

Alternatively, consume the destination using your application's AppRouter. See [Application Routes and Destinations](https://help.sap.com/docs/btp/sap-business-technology-platform/application-routes-and-destinations).

The AppRouter handles token retrieval automatically when the destination is correctly configured. You will still need to leverage the `Find a Destination` response structure in your application code to extract the resolved URL and credentials.

#### Providing Evidence

When raising a support ticket or sharing your configuration for review, attach a screenshot showing the code structure you used to consume the destination (either the `find destination` API call or the AppRouter configuration). This allows support teams to verify that the destination is being consumed correctly.

## Troubleshooting: 401 Unauthorized

A `401 Unauthorized` response can occur for different reasons. The error message in the response body identifies the root cause.

### Login Failed — Invalid User

**Error message**: `Unable to authenticate the client (Login failed - invalid user)`

This error means the user performing the request does not have the required permissions in SuccessFactors. Check the following:

1. Does your SuccessFactors instance and your SAP BTP subaccount share the same SAP Cloud Identity Services (IAS) tenant for authentication?
2. Is the Subject Name Identifier (SNI) configured with the same value for both SuccessFactors and SAP BTP in IAS?
3. Does the user executing the request have the permissions required to call the SuccessFactors API?

### Invalid User UUID

**Error message**: `Invalid useruuid`

This error means the UUID in the JWT token does not match the UUID stored in the SuccessFactors system.

To resolve this, add the following additional property to your destination:

| Key | Value |
| --- | --- |
| `skipUserUuidInSAMLAttributes` | `true` |

#### About `skipUserUuidInSAMLAttributes`

When set to `true`, any SAML assertion attribute named `user_uuid` will not be included in the resulting SAML assertion XML, even if such a value was found in the JWT specifying the user's identity.

For more information, see [SAML Assertion Authentication](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/saml-assertion-authentication) in the SAP BTP Connectivity documentation.

## Validating the Destination Using Postman

Before integrating the destination into your application, you can use [Postman](https://www.postman.com/) to verify that the OAuth2 token exchange and the SuccessFactors API call work end-to-end. This is a useful intermediate step to isolate whether an issue lies in the destination configuration itself or in your application's consumption logic.

### Step 1: Obtain an OAuth2 Token

Send a `POST` request to the SuccessFactors token endpoint to exchange a SAML assertion for a bearer token.

- **Method**: `POST`
- **URL**: `https://api4.successfactors.com/oauth/token`
- **Headers**:

  | Key | Value |
  | --- | --- |
  | `Content-Type` | `application/x-www-form-urlencoded` |

- **Body** (form-urlencoded):

  | Key | Value |
  | --- | --- |
  | `grant_type` | `urn:ietf:params:oauth:grant-type:saml2-bearer` |
  | `assertion` | The Base64-encoded SAML assertion. |
  | `company_id` | Your SuccessFactors company ID. |
  | `client_id` | The API Key of the OAuth client registered in SuccessFactors. |

A successful response returns a JSON payload containing an `access_token`. Copy this value for use in the next step.

### Step 2: Call the SuccessFactors OData API

Use the access token obtained in step 1 to call a SuccessFactors OData endpoint directly.

- **Method**: `GET`
- **URL**: `https://api4.successfactors.com/odata/v2/<EntitySet>` (replace `<EntitySet>` with the entity you want to query, for example `User`)
- **Headers**:

  | Key | Value |
  | --- | --- |
  | `Authorization` | `Bearer <access_token>` |
  | `Accept` | `application/json` |

A successful `200 OK` response confirms that:

1. The trust between SAP BTP and SuccessFactors is correctly established.
2. The OAuth client API Key and certificate are valid.
3. The SAML assertion is being accepted by SuccessFactors.

### Interpreting Results

| Response | Likely Cause |
| --- | --- |
| `200 OK` | Configuration is correct. The issue is in how the destination is consumed by your application. |
| `401 Unauthorized` | The API Key or certificate is incorrect, the user lacks permissions, or there is a UUID mismatch. Repeat [Step 2](#step-2-register-the-oauth-client-in-sap-successfactors) and [Step 3](#step-3-create-the-sap-btp-destination), and see [Troubleshooting: 401 Unauthorized](#troubleshooting-401-unauthorized) for specific error messages and fixes. |
| `500 Internal Server Error` | SuccessFactors cannot process the request. Verify the `company_id`, `Audience`, `AuthnContextClassRef`, and `nameIdFormat` values in the destination. |

## Sample Destination Configuration

The following is an example of a fully exported SAP BTP destination configuration for SuccessFactors. Sensitive values have been removed.

```json
{
    "destination": {
        "Authentication": "OAuth2SAMLBearerAssertion",
        "HTML5.DynamicDestination": "true",
        "KeyStoreLocation": "<certificate-filename>.p12",
        "KeyStorePassword": "<removed>",
        "Name": "<destination-name>",
        "ProxyType": "Internet",
        "Type": "HTTP",
        "URL": "https://api-in10.hr.cloud.sap:443",
        "WebIDEEnabled": "true",
        "WebIDEUsage": "odata_gen",
        "XFSystemName": "<company-id>",
        "apiKey": "<removed>",
        "audience": "www.successfactors.com",
        "authnContextClassRef": "urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession",
        "clientKey": "<removed>",
        "companyId": "<company-id>",
        "nameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
        "product.name": "SAP SuccessFactors",
        "tokenServiceURL": "https://api-in10.hr.cloud.sap:443/oauth/token",
        "tokenServiceURLType": "Dedicated"
    }
}
```

> **Note**: The `URL` and `tokenServiceURL` hostnames are region-specific. Replace `api-in10.hr.cloud.sap` with the hostname that corresponds to your SuccessFactors data centre.

## Common Misconceptions

### SAP Cloud Connector Is Not Required

SuccessFactors is a cloud solution. Connections from an SAP BTP subaccount to SuccessFactors do **not** involve the SAP Cloud Connector (SCC). The Cloud Connector is only required when exposing on-premise systems to SAP BTP. If you are encountering a `500 Internal Server Error` with `OAuth2SAMLBearerAssertion`, the cause lies in one of the following areas:

- The OAuth client setup in SuccessFactors.
- The destination configuration in SAP BTP.
- The way the application consumes the destination at runtime.

### Basic Authentication Is Not a Suitable Workaround

While Basic Authentication may work as a temporary measure, it is not recommended for production use and is typically prohibited by security policies. The correct approach is `OAuth2SAMLBearerAssertion` as described in this guide.

## Reporting Issues

When raising a support ticket for connectivity issues with a SuccessFactors destination, provide the following diagnostic artifacts. Collecting these upfront significantly reduces the time needed to diagnose the issue.

### Required Artifacts

1. **Step-by-step screenshots** showing how to reproduce the issue, with the full browser URL visible at each step.

2. **HTTP trace (HAR file)**: Capture a full network trace from page load until the issue reproduces. See [SAP Note 1990706 - How to capture an HTTP trace using Google Chrome or MS Edge (Chromium)](https://launchpad.support.sap.com/#/notes/1990706). The HAR file must include all requests and responses, headers, payloads, and timing information.

3. **Browser console log**: Collect the browser console output while reproducing the issue. See [SAP Note 2764266 - How to get Network Trace and Console Logs](https://launchpad.support.sap.com/#/notes/2764266).

4. **Exported destination configuration**: Export the destination from SAP BTP Cockpit as described in [SAP Note 3008889 - How to export destinations from the SAP BTP cockpit](https://launchpad.support.sap.com/#/notes/3008889). Confirm whether the connectivity test for the destination is successful.

5. **Code structure screenshot**: Provide a screenshot showing the code used to consume the destination, whether using the `find destination` REST API or the AppRouter configuration.

### Related SAP Notes

- [SAP Note 3384252 - OAuth in an integration between SAP SuccessFactors and SAP Business Application Studio (BAS) Deploy UI5](https://launchpad.support.sap.com/#/notes/3384252)

## Additional Resources

- [Create and Consume Destination for Cloud Foundry Application](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/create-and-consume-destination-for-cloud-foundry-application)
- [Consuming the Destination Service](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/consuming-destination-service)
- [Application Routes and Destinations](https://help.sap.com/docs/btp/sap-business-technology-platform/application-routes-and-destinations)
- [Find a Destination REST API](https://api.sap.com/api/SAP_CP_CF_Connectivity_Destination/resource/Find_a_Destination)
- [Find Destination Response Structure](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/find-destination-response-structure)
- [HTTP Destinations](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/http-destinations)

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
