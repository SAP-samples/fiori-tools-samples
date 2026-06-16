# Expose a Deployed CAP Project as an SAP BTP Destination

## Prerequisites

- You have an SAP BTP account, for example a trial account. For more information, see [SAP Business Technology Platform](https://account.hana.ondemand.com/).
- You are subscribed to the SAP Build Work Zone. For more information, [Set Up SAP Build Work Zone, standard edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- You have deployed a CAP project with an SAP Fiori UI. For more information, see [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://community.sap.com/t5/technology-blogs-by-sap/build-and-deploy-a-cap-project-node-js-api-with-a-sap-fiori-elements-ui-and/ba-p/13537906).
- You have exposed the SAP BTP destination from the same subaccount where the CAP project is deployed.

## Implementation

1. Access your Node.js service and select your dev space, which lists all the running services on your space:

[![Alt text](Step1.png "CAP project service")](Step1.png)

2. Select the Node.js service which exposes the CAP endpoint:

[![Alt text](Step2.png "CAP Project Endpoint")](Step2.png)

In this example, the endpoint is:

`https://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com`

[![Alt text](Step2b.png "Catalog of Services")](Step2b.png)

When you select any of the exposed services, for example, `https://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/catalog`, you receive an `HTTP 401 unauthorized error` because you have not passed the appropriate headers to the application. Otherwise, your application is exposed to the internet with no security.

[![Alt text](Step2c.png "401 Error")](Step2c.png)

3. Access your Security XSUAA credentials by navigating back to the root of your subaccount and clicking `Instances and Subscriptions`.

[![Alt text](Step3.png "Instances and Subscriptions")](Step3.png)

4. Select the `Authorization and Trust Management Service` service instance that was deployed with your CAP project. In this example: `managedAppCAPProject-xsuaa-service`.

[![Alt text](Step4.png "XSUAA Service Instance")](Step4.png)

5. Select the `Service Keys` tab. If a key doesn't exist, create a new service key.

[![Alt text](Step5.png "XSUAA Service Key")](Step4.png)

In the service key, you need the following properties:

- `clientid`
- `clientsecret`
- `url`

Example:

```text
sb-managedappcapproject!t299668
xGRgYPoAXbMv2gqRIDontThinkSooZ7uY=
https://28bdb0fbtrial.authentication.us10.hana.ondemand.com
```

6. Create a new destination in your SAP BTP account, navigate to the `Connectivity` service, and click `Destinations`.

7. Click `Create destination` and change the `Authentication` type to `OAuth2ClientCredentials`:

```json
Name: capdestination
Description: CAP Project Destination
URL: from step 2 i.e. https://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com
Client ID: from step 5 i.e. sb-managedappcapproject!t299668
Client Secret: from step 5 i.e. xGRgYPoAXbMv2gqRIDontThinkSooZ7uY=
Token Service URL: from step 5 i.e. https://28bdb0fbtrial.authentication.us10.hana.ondemand.com appended with /oauth/token
Token Service user: same as client ID
Token Service password: same as client secret
HTML5.Timeout: 60000
WebIDEEnabled: true
WebIDEUsage: odata_gen
HTML5.DynamicDestination: true
HTML5.Timeout: 60000
Authentication: OAuth2ClientCredentials
```

   1. You must append `/oauth/token` to the `Token Service URL` property.

   2. Save the destination and see the following:

   [![Alt text](Step6.png "New Destination")](Step6.png)

   Using an SAP BTP destination with `OAuth2ClientCredentials` is typically used to authenticate a service or application using the Client Credentials Grant rather than a user. To switch to using a Token Exchange Grant, change the `Authentication` type to `OAuth2UserTokenExchange`, which is typically used to authenticate a user across systems using the Token Exchange Grant and removes the requirement to have a `Token User` and `Token Service Password` in the destination configuration.

For more information about destinations, see [SAP BTP Destinations in a nutshell Part 3 - OAuth 2.0 Client Credentials](https://community.sap.com/t5/technology-blogs-by-members/sap-btp-destinations-in-a-nutshell-part-3-oauth-2-0-client-credentials/ba-p/13577101).


## Validation

### Using SAP Business Application Sutdio

1. Log into SAP Business Application Studio and click `Service Centre`:

[![Alt text](Step7.png "Service Centre")](Step7.png)

2. Select the `capdestination` destination you created and the status is displayed as `Not Available`. You must append the service path.

3. Enter the path to the service you want to access, that is, `/odata/v4/catalog` and click `Connect`:

[![Alt text](Step7b.png "Service Centre")](Step7b.png)

### Using the Terminal

Use `curl` in the terminal as follows:

```bash
curl -L "https://capdestination.dest/odata/v4/catalog" -vs > curl-cap-output.txt 2>&1
```

This generates a file called `curl-cap-output.txt` with the output of the request. The file contains the OData response:

```JSON
{
  "@odata.context": "$metadata",
  "@odata.metadataEtag": "W/\"kpKGEWiUkdl2tvln8+lIbb+WgNsbQRujr+H11i5pAUg=\"",
  "value": [
    {
      "name": "Books",
      "url": "Books"
    }
  ]
}

```

You can now use SAP Fiori tools generator to generate HTML5 applications that consume the OData services from your CAP project services.

## Want to Go Cross-Subaccount and Regions

For more information, see [SAP BTP: How to call protected app across regions with SAML and OAuth](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-btp-how-to-call-protected-app-across-regions-with-saml-and-oauth-2/ba-p/13546145).

## Key Points

- **Trust must be configured on the back-end subaccount:** Download the IdP metadata from the front-end subaccount (using Connectivity > Destinations > Download IDP Metadata) and register it as a new trust configuration in the back-end subaccount (Security > Trust Configuration). Uncheck **Available for User Logon** because this trust is for app-to-app calls only.
- **The destination is created in the front-end subaccount, not the back-end:** The `OAuth2SAMLBearerAssertion` destination lives next to the app that makes the call. It requires three values from the back-end's SAML metadata: the `entityID`, that is, the Audience; the `AssertionConsumerService` URI-binding URL, that is, the Token Service URL; and the `nameIDFormat`, added as an additional property.
- **Token exchange is required to call the destination service:** You cannot use client credentials alone. The user JWT token must contain the `uaa.user` scope, which requires assigning the corresponding role collection to the user in the front-end subaccount. Token exchange passes this scope through to the destination service token.
- **The front-end app must be user-centric with an approuter:** SAML is designed to carry user identity across systems, so a direct app-to-app call without a logged-in user is not supported by this flow. The approuter handles login and forwards the user JWT token to the back-end core service.
- **The destination service handles the SAML-to-OAuth exchange automatically:** Once the destination is correctly configured and trust is in place, calling the destination service API returns both the target URL and a ready-to-use JWT token issued by the back-end XSUAA, so no manual SAML assertion handling is needed in your code.

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
