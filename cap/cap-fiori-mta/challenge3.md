## Support SAP Launchpad Service
- From the root of your CAP project, change into Fiori Elements application directory 
```bash
cd managedAppCAPProject/app/feproject-ui
```
- Run the following command to configure FLP;
```bash
  npx -p @sap/ux-ui5-tooling fiori add flp-config
```
- The following questions will be asked, please use values representing your application;

_Remember, semantic object represents a business entity such as a customer, a sales order, or a product._
```bash
Semantic Object -> MyFEApplication
Action -> display
Title -> List Report Object Page
Subtitle - Fiori Application 
 ```
- Change 1 - `crossNavigation` node will be added to your `manifest.json` file;
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
- Change 2 - Additional `i18n.properties` will also be appended;
```json
flpTitle=List Report Object Page

flpSubtitle=
```
- Rebuild and redeploy your application to Cloud Foundry
- Ensure you have subscribed and configured [Launchpad Service](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html) on your SAP BTP subaccount
- Next, you will need to create a [Launchpad Site](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-create-sitelaunchpad.html) to consume your new Fiori Elements application 