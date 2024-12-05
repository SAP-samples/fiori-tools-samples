# Samples SAMLAssertion destination configured to point SAP S/4HANA Cloud Public tenant



# Prerequisites
1. You have completed Step 2 and Step 3 https://developers.sap.com/tutorials/abap-custom-ui-bas-connect-s4hc.html as this will create the System to System trust

## Create the SAMLAssertion Destination
1. Open `s4hana-cloud_saml` using a text editor
2. Replace all instances of `my1111111` with your specific hostname
3. Login to your SAP BTP subaccount, select the `Destinations` tab, select `Import Destination`
4. You have now created a SAB BTP subaccount destination

You can refer to this link to confirm your destination is configured correctly;

https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/31876c06f99645f289d802f9c95fb62b.html

## How SAMLAssertion flow works

1. SAP BTP, typically configured with a local SAML IdP, sends a SAML Assertion (including the SAML Issuer and signature) to SAP S/4HANA Cloud, Public Edition (SAML SP).
2. The Communication System on SAP S/4HANA Cloud validates the SAML Issuer and signature.
3. It then maps the user ID and ID format.
4. The user with the same subject ID must exist in both the SAP S/4HANA Cloud and SAP BTP systems.

### NameID Format in SAP BTP Destination
In your SAP BTP destination, the nameIdFormat property affects the behavior of user ID mapping:
* urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress: User ID maps to the email address
* urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified (or not set): User ID maps to the username

## Authorization Requirements
Different authorizations are required for various operations in SAP S/4HANA Cloud, such as:

* Accessing catalog services to browse available OData Services
* Running previews and accessing OData Services
* Deploying SAPUI5 applications in S/4HANA Cloud

| Business Catalog | Key User Extensibility(client 100)  | Developer Extensibility (client 080) |
| ------------- | ------------- | ------------- |
| To access OData Services | SAP_CORE_BC_EXT_TST  | SAP_CORE_BC_EXT_TST |
| To deploy application | SAP_CORE_BC_EXT_UI  | SAP_A4C_BC_DEV_UID_PC |
| Business Role | BR_EXTENSIBILITY_SPEC  | BR_DEVELOPER |

To better understand the roles, please refer to [link](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/a71e8ffa917545c8af0a7c77992f8eba.html?q=SAP_CORE_BC_EXT_UI).

## Debugging Connectivity Issues

### Option 1. Authorisation Failures 

You can also review the `Display Authorization Trace` as an S/4H Administrator on your instance;

https://help.sap.com/docs/SAP_S4HANA_CLOUD/55a7cb346519450cb9e6d21c1ecd6ec1/ebb91d3758c441b18bf9ebd0798d424e.html

- Typical criteria is Status: `Failed`
- Typical criteria is `Users`, filter by the required user details, you will need so select the user from the list

### Option 2. Connectivity Failures

Using the search option on your S/4H instance, you can also review the failed requests using the `Display Connectivity Trace` as an S/4H Administrator;

Filter by request path = `/sap/opu/odata/IWFND/CATALOGSERVICE` to see calls to V2 catalog service, request method is `GET`

Filter by request path = `/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/` to see calls for V4 catalog service, request method is `GET`

Refer to this link for more information;

https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/b89201fc39d041d790fdbb0bde873d17.html

## Related Links
Integrating SAP Business Application Studio - 
https://help.sap.com/docs/SAP_S4HANA_CLOUD/0f69f8fb28ac4bf48d2b57b9637e81fa/22bc724fd51a4aa4a4d1c5854db7e026.html

Develop a Custom UI for an SAP S/4HANA Cloud System - https://developers.sap.com/tutorials/abap-custom-ui-bas-develop-s4hc.html

Create a SAP Fiori App and Deploy it to SAP S/4HANA Cloud, ABAP Environment - https://developers.sap.com/tutorials/abap-s4hanacloud-procurement-purchasereq-shop-ui.html

