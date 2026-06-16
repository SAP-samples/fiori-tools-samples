## Enabling CDS Hybrid Mode in a CAP Project with an SAP Fiori UI Front End

This CAP project and SAP Fiori application were generated using the steps outlined in the [Build and deploy a CAP Project Node.js API with an SAP Fiori Elements UI and a managed approuter configuration](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) blog post using the `Managed Approuter` configuration as the HTML5 application runtime.
The [managed approuter](../cap-fiori-mta/README.md) project is the base project used in this approach.

## Prerequisites
- You have a HANA Cloud database set up and running in your cloud space. For more information, see [Create an SAP HANA Database Project](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html).
- You have deployed the CAP project and SAP Fiori application to Cloud Foundry.

## 1. Changes to the `mta.yaml` File

These changes are required to reduce the number of manual tasks.

1. Append the `properties` node to `managedAppCAPProject-db-deployer` so the local and deployed CAP projects both share the same HDI instance:

```yaml
  - name: managedAppCAPProject-db-deployer
    type: hdb
    path: db
    requires:
      - name: managedAppCAPProject-db
        properties:
          TARGET_CONTAINER: ~{hdi-service-name}
```

2. Update the `uaa_managedAppCAPProject` -> `service-key` parameter to `managedAppCAPProject-xsuaa-service-key`, when binding to the HANA service:

```YAML
  - name: managedAppCAPProject-destination-content
    type: com.sap.application.content
    requires:
      - name: managedAppCAPProject-destination-service
        parameters:
          content-target: true
      - name: managedAppCAPProject_html_repo_host
        parameters:
          service-key:
            name: managedAppCAPProject_html_repo_host-key
      - name: uaa_managedAppCAPProject
        parameters:
          service-key:
            name: managedAppCAPProject-xsuaa-service-key
```

3. Update `managedAppCAPProject-db` to append the `service-key` parameter, when binding to the HANA service:

```yaml
  - name: managedAppCAPProject-db
    type: com.sap.xs.hdi-container
    parameters:
      service: hana
      service-keys:
        - name: managedAppCAPProject-db-key
      service-plan: hdi-shared
    properties:
      hdi-service-name: ${service-name}
```

## 2. Append Approuter

1. Append a local router to handle the XSUAA security locally:

```bash
cds add approuter
```
The command creates several files in the `app` folder. To customize these files, they must be moved to a separate folder:

```bash
mkdir -p localrouter
mv app/default-env.json app/package.json app/xs-app.json localrouter/
```

2. Modify the `default-env.json` file so it uses port `5001`:

```JSON
{
  "destinations": [
    {
      "name": "srv-api",
      "url": "http://localhost:4004",
      "forwardAuthToken": true
    }
  ],
  "PORT": 5001
}
```

To learn more about approuter, see the following links:

- [@sap/approuter](https://www.npmjs.com/package/@sap/approuter#overview)
- [Application-router on SAP BTP](https://help.sap.com/docs/btp/sap-business-technology-platform/application-router)

## 3. Update the `xs-security.json` File

1. Add support for the different OAuth endpoints, that is, for local development with Visual Studio Code, SAP Business Application Studio, and SAP BTP Cloud Foundry to the `xs-security.json` file:

```JSON
  "oauth2-configuration": {
    "redirect-uris": [
        "https://**.hana.ondemand.com/**",
        "https://**.applicationstudio.cloud.sap/**",
        "http://localhost:*/**"
    ]
  },
```

2. Apply new `scopes` and `role-templates` to lock down your catalog service:

```JSON
  "scopes": [
    {
      "name": "$XSAPPNAME.capuser",
      "description": "CAP project generated role scope"
    }
  ],
  "role-templates": [
    {
      "name": "capuser",
      "description": "CAP project generated role template",
      "scope-references": ["$XSAPPNAME.capuser"],
      "attribute-references": []
    }
  ],
```

## 4. Apply Security to Catalog Service

Edit `srv` -> `cat-service.cds` and replace `@requires: 'authenticated-user'` with `@(requires: 'capuser')`. 