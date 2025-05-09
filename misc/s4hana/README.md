# Samples SAMLAssertion destination configured to point SAP S/4HANA Cloud Public tenant



# Prerequisites
1. You have completed Step 2 and Step 3 https://developers.sap.com/tutorials/abap-custom-ui-bas-connect-s4hc.html as this will create the System to System trust required to enable SAML between the respective systems. 
2. You have administrative access to your S/4HANA Cloud system to allow to configure and debug connectivity issues.
3. You are subscribed to SAP Business Application Studio, follow this [tutorial](https://help.sap.com/docs/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html) for more information

## Create a SAP BTP SAMLAssertion Destination to consume V2 and V4 OData Catalogs
1. Open [s4hana-cloud_saml](s4hana-cloud_saml) file using any text editor or browser
2. Replace all instances of `my1111111` with your specific hostname
3. Log in to your SAP BTP subaccount, select the `Destinations` tab, and select `Import Destination`
4. You have now created a SAB BTP subaccount destination using `odata_abap` to reflect the type of destination created
5. Login to your SAP Business Application Studio to consume the new destination to validate that your connectivity is working

You can refer to this link to confirm your destination is configured correctly;
https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/31876c06f99645f289d802f9c95fb62b.html

__Note: In some cases, you might want to create an `odata_gen` SAP BTP destination to consume a specific OData service, then refer to this [tutorial](https://ga.support.sap.com/dtp/viewer/index.html#/tree/3046/actions/45995:48363:53594:54336) to create a Full or Partial URL destination. This scenario is typical where a user does not have access to the Catalog but only individual services__

## How SAMLAssertion flow works

1. SAP BTP, typically configured with a local SAML Identity Providers (IdP), sends a SAML Assertion (including the SAML Issuer and signature) to SAP S/4HANA Cloud, Public Edition (SAML SP).
2. The Communication System on SAP S/4HANA Cloud validates the SAML Issuer and signature.
3. It then maps the user ID and ID format.
4. The user with the same subject ID must exist in both the SAP S/4HANA Cloud and SAP BTP systems.

### NameID Format in SAP BTP Destination
In your SAP BTP destination, the `nameIdFormat` property affects the behaviour of user ID mapping against your SAP S/4HANA Cloud instance
* `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` - User ID maps to the email address
* `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` - User ID maps to the username

Unless you have a specific technical reason, the default should be `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` as the `nameIdFormat`. The email address as defined in your IdP i.e OpenID Connect or IAS must match the S4HC email address configured with the appropriate roles. Please refer to the related links section below to understand more around adding other IdP's to your SAB BTP system.

## Authorization Requirements
Different authorizations are required for various operations in SAP S/4HANA Cloud, such as:

* Accessing catalog services to browse available OData Services
* Running previews and accessing OData Services
* Deploying SAPUI5 applications in S/4HANA Cloud

You will be required to add the specific `Business Role` to allow a specific user to `deploy` and `undeploy` SAPUI5 applications. All other users can be assigned the `OData Services` role;

| Business Catalog | Key User Extensibility/Customizing(client 100)  | Developer Extensibility (client 080) |
| ------------- | ------------- |--------------------------------------|
| To access OData Services | SAP_CORE_BC_EXT_TST  | SAP_CORE_BC_EXT_TST                  |
| To deploy application | SAP_CORE_BC_EXT_UI  | SAP_A4C_BC_DEV_UID_PC                |
| Business Role | SAP_BR_EXTENSIBILITY_SPEC  | SAP_BR_DEVELOPER        |

Business roles need to be created based on business role templates, the recommended business role templates are `SAP_BR_DEVELOPER` and `SAP_BR_EXTENSIBILITY_SPEC`.

Please note, in some instances, the name of the business role might defer or in some cases the specific business catalogs are added to an existing business role that is not `SAP_BR_DEVELOPER` or `SAP_BR_EXTENSIBILITY_SPEC` for example  `BR_DEVELOPER` or in some instances `Z_BR_DEVELOPER`.


To better understand the roles, please refer to [link](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/a71e8ffa917545c8af0a7c77992f8eba.html?q=SAP_CORE_BC_EXT_UI).

Different tenant types:
`Developer Extensibility (client 080)`
**Purpose:** Facilitates developer extensibility within the SAP S/4HANA Cloud ABAP environment.
**Features:**
- Provides full ABAP development tool access to released SAP S/4HANA Cloud business objects and extension points.
- Supports the creation of advanced, cloud-ready, and upgrade-stable custom ABAP code.
- Ensures that development objects are client-independent, allowing access from other tenants if permissions are granted. 
- Build your custom developments based on lifecycle-stable SAP objects.
- Only developer extensibility is supported.

`Key User Extensibility/Customizing (client 100)`
**Purpose:** Serves as the primary environment for configuration and customization activities.
**Features:**
- Allows for the setup and adjustment of system settings to meet specific business requirements.
- Acts as a bridge between development and testing activities, ensuring that custom developments are appropriately integrated and tested
- Configuration activities based on the reference content from SAP Central Business Configuration.
- To make your configuration content available in the test and production systems, you need to transport them.
- Create low-code custom developments in key user apps. 
- In Customizing Tenant, only Key User Extensibility is supported. 
- Form Templates are under the Key User Extensibility category, so you can only create a Form Template in customizing tenants.

### Steps for Developer Extensibility Tenant

To ensure your specific user has the appropriate `SAP_BR_DEVELOPER` role to consume OData XML services, and deploy SAPUI5 applications, edit your specific S4HC user;

Search for application `Maintain Business Users`;
![MaintainUsersPart1.png](MaintainUsersPart1.png)

Select your specific user and select `Assigned Business Roles`;

![MaintainUsersPart1.png](MaintainUsersPart2.png)

If `SAP_BR_DEVELOPER` is missing, select `Add` and search for `SAP_BR_DEVELOPER` to append the Business Role to your specific user.

Next, select the `SAP_BR_DEVELOPER` role that you just added, select `Business Catalogs`and ensure `SAP_CORE_BC_EXT_TST` and `SAP_A4C_BC_DEV_UID_PC` are added;

![MaintainUsersPart1.png](MaintainUsersPart3.png)

The same steps can be used to append the business role `SAP_BR_EXTENSIBILITY_SPEC` for a `Key User Extensibility/` tenant.

## Debugging Connectivity Issues

### Option 1. Authorisation Failures 

You can also review the `Display Authorization Trace` as an S/4HANA Administrator on your instance;

https://help.sap.com/docs/SAP_S4HANA_CLOUD/55a7cb346519450cb9e6d21c1ecd6ec1/ebb91d3758c441b18bf9ebd0798d424e.html

- Typical criteria is Status: `Failed`
- Typical criteria is `Users`, filtered by the required user details, you will need to select the user from the list

### Option 2. Connectivity Failures

Using the search option on your S/4HANA instance, you can also review the failed requests using the `Display Connectivity Trace` as an S/4HANA Administrator;

Filter by request path = `/sap/opu/odata/IWFND/CATALOGSERVICE` to see calls to V2 catalog service, request method is `GET`

Filter by request path = `/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/` to see calls for V4 catalog service, request method is `GET`

Refer to this link for more information;

[https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/a4f6ccd072f147f299b1d856062c8dc8.html](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/a4f6ccd072f147f299b1d856062c8dc8.html)

Search for the application `Display Connectivity Trace`;

![DisplayConnectivityPart1.png](DisplayConnectivityPart1.png)

Define a new Trace using the `Request Method` of `GET` and the `Path Prefix` of `/sap/opu/odata/IWFND/CATALOGSERVICE`, click save;
![DisplayConnectivityPart1.png](DisplayConnectivityPart2.png)

The new trace will populate the table if new events are found;

![DisplayConnectivityPart1.png](DisplayConnectivityPart3.png)

### Option 3. Bypassing Business Application Studio

Another option is to create a dynamic destination URL; 

__You need to ensure you are subscribed to [SAP Build Work Zone](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html) to ensure the `dynamic_dest` path is exposed on your SAP BTP subaccount__

1. Obtain the name of your SAP BTP subaccount destination configured using SAMLAssertion i.e. `mys4hc-destination`
2. Ensure the SAP BTP destination `Additional Properties` contains `HTML5.DynamicDestination: true` and `WebIDEEnabled: true`
3. Obtain the name of your `Subdomain` and `API endpoint` by opening your SAP BTP subaccount `overview` page, i.e. subdomain is `mytrial-account-staging` and API endpoint is `https://api.cf.eu10.hana.ondemand.com`

Using the following template, replace the required parameters;

```
https://<your-subaccount-subdomain>.launchpad.cfapps.<your-region-api-endpoint>.hana.ondemand.com/dynamic_dest/<your-destination-name>/<path-to-your-OData-metadata-or-service-path>
```
For example, here is the base URL;
```json
https://mytrial-account.launchpad.cfapps.us10.hana.ondemand.com/dynamic_dest/mys4hc-destination/
```

Append V2 Catalog to base URL;
```
https://mytrial-account.launchpad.cfapps.us10.hana.ondemand.com/dynamic_dest/mys4hc-destination/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection
```

Append V4 Catalog to base URL;
```
https://mytrial-account.launchpad.cfapps.us10.hana.ondemand.com/dynamic_dest/mys4hc-destination/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/0002/ServiceGroups?$expand=DefaultSystem($expand=Services)
```

For more information, please refer to this [site](https://ga.support.sap.com/dtp/viewer/index.html#/tree/3046/actions/45995:48363:53594:54336:51208)

## Related Links
Integrating SAP Business Application Studio - 
[https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/22bc724fd51a4aa4a4d1c5854db7e026.html](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/22bc724fd51a4aa4a4d1c5854db7e026.html)

Develop a Custom UI for an SAP S/4HANA Cloud System - [https://developers.sap.com/tutorials/abap-custom-ui-bas-develop-s4hc.html
](https://developers.sap.com/tutorials/abap-custom-ui-bas-develop-s4hc.html
)

Create a SAP Fiori App and Deploy it to SAP S/4HANA Cloud, ABAP Environment - [https://developers.sap.com/tutorials/abap-s4hanacloud-procurement-purchasereq-shop-ui.html](https://developers.sap.com/tutorials/abap-s4hanacloud-procurement-purchasereq-shop-ui.html)

Set Up Trust Between SAP Cloud Identity Services and SAP BTP, Cloud Foundry environment - [https://developers.sap.com/tutorials/abap-custom-ui-trust-cf.html](https://developers.sap.com/tutorials/abap-custom-ui-trust-cf.html)
- Required when adding another trust configuration that is using a different identity provider, for example where you are adding an IAS provider to manage your user profiles
- The trust protocol defined in your new IdP must be `SAML` to ensure the `SAMLAssertion` configuration in your SAP BTP destination works when connecting to your S4HC instance using `SAMLAssertion`

User Management in a Nutshell (IAS or IDP) - [https://community.sap.com/t5/enterprise-resource-planning-blogs-by-sap/user-management-in-a-nutshell-for-the-sap-s-4hana-cloud-public-edition/ba-p/13556782](https://community.sap.com/t5/enterprise-resource-planning-blogs-by-sap/user-management-in-a-nutshell-for-the-sap-s-4hana-cloud-public-edition/ba-p/13556782)
