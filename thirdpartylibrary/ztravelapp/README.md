# Adding an External Library to Your SAP Fiori UI Application

In this sample project, `xml-js` is added as an external library.

## Prerequisites

- You have an SAP Business Technology Platform (SAP BTP) account.
- You are subscribed to SAP Business Application Studio. For more information, see [Getting Started with SAP Business Application Studio](https://help.sap.com/products/SAP%20Business%20Application%20Studio/9d1db9835307451daa8c930fbd9ab264/6331319fd9ea4f0ea5331e21df329539.html).
- You have the `northwind` sub-account destination available.

## Create SAP Fiori Dev Space

From your SAP BTP cockpit, select Instances and Subscriptions and select SAP Business Application Studio and open your dev space manager in a new tab. Create an SAP Fiori dev space.

## Generate a Freestyle SAPUI5 Application

For more information, see [Developing Apps with SAP Fiori Tools](https://sapui5.hana.ondemand.com/sdk/#/topic/a460a7348a6c431a8bd967ab9fb8d918).

## Tasks

Add the third-party library to the `package.json` file:
```bash
npm install xml-js --save-prod
```

Add the UI5 tooling extension to include a custom middleware and a custom task which allows use of `npm` package names in your code:
```bash
npm install ui5-tooling-modules --save-prod
```

Open the `ui5.yaml` file and add a new task, which ensures the alignment is maintained:
```yaml
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
      configuration:
        addToNamespace: true
```

Open the `View1.controller.js` file and add the `xml-js` library:
```javascript
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "xml-js"],
```

For more information about the `sap.ui.defined` JavaScript namespace, see [sap.ui.define API Reference](https://sapui5.hana.ondemand.com/sdk/#/api/sap.ui%23methods/sap.ui.define). Pay attention to the `Third Party Modules` section, which provides guidance on how third-party modules are imported and referenced.

Next, update the `function` to reference this library:
```javascript
function (Controller, xmljs) {
```

With these changes, you can now consume the library inside your code:
```javascript
 var xmlToJson = JSON.parse(
      xmljs.xml2json(xml, {
        compact: true,
        spaces: 4,
      })
    );
    console.log(`>>>> xmlToJson ${JSON.stringify(xmlToJson)}`);
```

## Additional Links

- [External libraries in UI5 + CAP + SAP Build Work Zone, Standard Edition](https://blogs.sap.com/2023/11/08/external-libraries-in-ui5-cap-sap-build-work-zone-standard-edition/)
- [Smart templates and SAP Fiori Apps – 57 Tips and Tricks](https://community.sap.com/t5/-/-/m-p/13406652)

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
