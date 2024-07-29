# Expose a deployed CAP project as an SAP BTP destination


## Prerequisites

- You have an SAP BTP account, for example a [trial account](https://account.hana.ondemand.com/)
- You are subscribed to the SAP Build Work Zone, follow this [tutorial](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html) for more information
- You have deployed a CAP project with a SAPUI5 Fiori UI using this [blog post](https://community.sap.com/t5/technology-blogs-by-sap/build-and-deploy-a-cap-project-node-js-api-with-a-sap-fiori-elements-ui-and/ba-p/13537906)

## Description

For more information around destinations, refer to this [blog post](https://community.sap.com/t5/technology-blogs-by-members/sap-btp-destinations-in-a-nutshell-part-3-oauth-2-0-client-credentials/ba-p/13577101).

Step1. Access your `nodejs` service, selecting your dev space which will list all the running services on your space;

![Alt text](Step1.png?raw=true "CAP project service")

Step2. Select the `nodejs` service which will expose the CAP endpoint;

![Alt text](Step2.png?raw=true "CAP Project Endpoint")

In this case, the endpoint is;

https://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com

![Alt text](Step2b.png?raw=true "Catalog of services")

When you select any of the exposed services, for example; 

```
https://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/catalog
```

you will receive a `HTTP 401 unauthorized error` since you aren't passing the appropriate headers to the application otherwise your application would be exposed to the internet with no security;

![Alt text](Step2c.png?raw=true "401 Error")

Step3. Access your Security XSUAA credentials

Navigate back to the root of your subaccount and select `Instances and Subscriptions`, 

![Alt text](Step3.png?raw=true "Instances and Subscriptions")

Step4. Select the `Authorization and Trust Management Service` service instance that was deployed with your CAP project, in this case, `managedAppCAPProject-xsuaa-service`;

![Alt text](Step4.png?raw=true "XSUAA Service Instance")

Step5. Select the `Service Keys` tab, if a key doesn't exist, create a new service key;

![Alt text](Step4.png?raw=true "XSUAA Service Key")

In the service key, you will need the following properties;

- clientid
- clientsecret
- url

For example;
```
sb-managedappcapproject!t299668
xGRgYPoAXbMv2gqRIDontThinkSooZ7uY=
https://28bdb0fbtrial.authentication.us10.hana.ondemand.com
```

Step6. Create a new destination in your SAP BTP account, navigate to the `Connectivity` service and select `Destinations` and `Create destination` and change the `Authentication` type to `OAuth2ClientCredentials`;

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
```

Please note, you need to append `/oauth/token` to the `Token Service URL` property.

Save the destination and you should see the following;

![Alt text](Step6.png?raw=true "New Destination")

Sample export of the project;
```json
Description=CAP Project Destination
Type=HTTP
clientId=sb-managedappcapproject\!t299668
HTML5.Timeout=600000
HTML5.DynamicDestination=true
Authentication=OAuth2ClientCredentials
WebIDEUsage=odata_gen
Name=capdestination
WebIDEEnabled=true
tokenServiceURL=https\://28bdb0fbtrial.authentication.us10.hana.ondemand.com/oauth/token
URL=https\://28bdb0fbtrial-dev-managedappcapproject-srv.cfapps.us10-001.hana.ondemand.com/
ProxyType=Internet
tokenServiceURLType=Dedicated
tokenServiceUser=sb-managedappcapproject\!t299668
```

Step 7. Let's confirm everything works!

Login into Business Application Studio and select `Service Centre` on the left navigation bar;

![Alt text](Step7.png?raw=true "Service Centre")

Select the destination you created `capdestination` and it will show the status as `Not Available` since you need to append the service path;

Enter the path to the service you want to access i.e. `/odata/v4/catalog` and click `Connect`;

![Alt text](Step7b.png?raw=true "Service Centre")

Another way to test the destination is to use `curl` from a terminal window;

```bash
curl -L "$H2O_URL/destinations/capdestination/odata/v4/catalog" -vs > curl-cap-output.txt 2>&1
```

This will generate a file called `curl-cap-output.txt` with the output of the request; you should see the OData XML being returned;

```xml
{"@odata.context":"$metadata","@odata.metadataEtag":"W/\"kpKGEWiUkdl2tvln8+lIbb+WgNsbQRujr+H11i5pAUg=\"","value":[{"name":"Books","url":"Books"}]}
```

Now that everything is working! You can use the SAP Fiori tools generator to start generating HTML5 applications that consume the OData services from your CAP project services.

Want to go cross subaccount and regions? 

Follow this [blog post](https://community.sap.com/t5/technology-blogs-by-sap/sap-btp-how-to-call-protected-app-across-regions-with-saml-and-oauth-2/ba-p/13546145)

### License
Copyright (c) 2009-2023 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
