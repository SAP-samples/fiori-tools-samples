## Add Support for the SAP Launchpad Service

1. Navigate to the app directory of your SAP Fiori elements applications:
```bash
cd managedAppCAPProject/app/feproject-ui
```
2. Run the following command to configure the SAP Fiori launchpad:
```bash
  npx -p @sap/ux-ui5-tooling fiori add flp-config
```
  - You are asked the following questions:

```bash
Semantic Object -> MyFEApplication
Action -> display
Title -> List Report Page
Subtitle - An SAP Fiori application 
 ```
_Remember, a semantic object represents a business entity such as a customer, a sales order, or a product._

 - A `crossNavigation` node is added to the `manifest.json` file:
```json
"crossNavigation": {
            "inbounds": {
                "cap-tutorial-feprojectui-inbound": {
                    "signature": {
                        "parameters": {},
                        "additionalParameters": "allowed"
                    },
                    "semanticObject": "MyFEApplication",
                    "action": "display",
                    "title": "{{flpTitle}}",
                    "subTitle": "{{flpSubtitle}}",
                    "icon": ""
                }
            }
        }
```
  - An `i18n.properties` file is created:
```json
flpTitle=List Report Page

flpSubtitle=An SAP Fiori application
```
3. Rebuild and redeploy your application to Cloud Foundry.

4. Ensure you have subscribed and configured to the SAP launchpad service in your SAP BTP subaccount. For more information, see [Set Up SAP Build Work Zone, standard edition Using a Trial Account](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).

5. You must create an SAP launchpad site to consume your new SAP Fiori elements application. For more information, see [Create a Site Using SAP Build Work Zone, standard edition](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-create-sitelaunchpad.html).