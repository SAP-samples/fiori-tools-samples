# Adding External Library to your Fiori UI application

In this sample project, `xml-js` is going to be added as an external library.

# Prerequisites

- You’ll need an SAP Business Technology Platform (SAP BTP) account
- You are subscribed to SAP Business Application Studio, follow this [tutorial](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html) for more information
- Sub-account destination `northwind` is available

# Create SAP Fiori Dev Space

From your SAP BTP cockpit, select Instances and Subscriptions, select SAP Business Application Studio which will open a new tab into your dev space manager. Generate a SAP Fiori dev space.

# Generate a Fiori UI Freestyle Application

Please refer to the following link, [Developing Apps with SAP Fiori Tools](https://sapui5.hana.ondemand.com/sdk/#/topic/a460a7348a6c431a8bd967ab9fb8d918) for more information.

# Tasks

Append third party library to `package.json`;
```bash
npm install xml-js --save-prod
```

Append UI5 tooling extension to include a custom middleware and a custom task which allows use of NPM package names in your code;
```bash
npm install ui5-tooling-modules --save-prod
```

Open `ui5.yaml` and append a new task, ensuring the alignment is maintained;
```YAML
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
      configuration:
        addToNamespace: true
```

Open `View1.controller.js` and append the `xml-js` library;
```JS
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "xml-js"],
```

Understanding the `sap.ui.defined` JavaScript namespace, please refer to this [link](https://sapui5.hana.ondemand.com/sdk/#/api/sap.ui%23methods/sap.ui.define) paying attention to the `Third Party Modules` section, as this provides guidance on how third party modules are imported and referenced.

Next, update the `function` to reference this library;
```JS
function (Controller, xmljs) {
```

With these changes, you can now consume the library inside your code;
```JS
 var xmlToJson = JSON.parse(
      xmljs.xml2json(xml, {
        compact: true,
        spaces: 4,
      })
    );
    console.log(`>>>> xmlToJson ${JSON.stringify(xmlToJson)}`);
```

# Additional Links

* [External libraries in UI5 + CAP + SAP Build Work Zone, Standard Edition](https://blogs.sap.com/2023/11/08/external-libraries-in-ui5-cap-sap-build-work-zone-standard-edition/)
* [Smart templates and SAP Fiori Apps – 57 Tips and Tricks](https://blogs.sap.com/2019/09/20/smart-templates-tips-and-tricks/)