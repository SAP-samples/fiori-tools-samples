## Enabling CDS Hybrid Mode in a CAP project with a Fiori UI frontend

The CAP project and Fiori UI application were generated using the steps outlined in this [blog post](https://blogs.sap.com/2022/02/10/build-and-deploy-a-cap-project-node.js-api-with-a-sap-fiori-elements-ui-and-a-managed-approuter-configuration/) using the `Managed Approuter` configuration as the HTML5 application runtime.
The [managed approuter](../cap-fiori-mta/README.md) project is the base project used in this approach.

## Prerequisites
- HANA Cloud database is setup and running in your cloud space, refer to this [tutorial](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html)
- The CAP project and Fiori UI application are deployed to Cloud Foundry

## Step 1: Changes to `mta.yaml`

These changes required to reduce the amount of manual tasks and will hopefully be incorporated into a future edition of the SAP Fiori tools deployment generator.

Append the `properties` node to `managedAppCAPProject-db-deployer` so the local and deployed CAP projects both share the same HDI instance;

```yaml
  - name: managedAppCAPProject-db-deployer
    type: hdb
    path: db
    requires:
      - name: managedAppCAPProject-db
        properties:
          TARGET_CONTAINER: ~{hdi-service-name}
```

Update `uaa_managedAppCAPProject` -> `service-key` parameter to `managedAppCAPProject-xsuaa-service-key`, when binding to the HANA service, the key and service name are aligned;

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

Update `managedAppCAPProject-db` to append the `service-key` parameter, when binding to the HANA service, the key and service name are aligned;

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

## Step 2: Append Approuter

Understanding approuter more, follow these links;

- [@sap/approuter](https://www.npmjs.com/package/@sap/approuter#overview)
- [Application-router on SAP BTP](https://help.sap.com/docs/btp/sap-business-technology-platform/application-router)

Append a local router to handle the XSUAA security locally;
```bash
cds add approuter
```
The command will drop a number of files into the `app` folder but we want to control these so we are going to move them!
```bash
mkdir -p localrouter
mv app/default-env.json app/package.json app/xs-app.json localrouter/
```

Modify `default-env.json` so that is spins up on port `5001`;
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

## Step 3: Update xs-security.json

Append support for the different OAuth endpoints, for local development with VSCode, Business Application Studio and SAP BTP Cloud Foundry;
```JSON
  "oauth2-configuration": {
    "redirect-uris": [
        "https://**.hana.ondemand.com/**",
        "https://**.applicationstudio.cloud.sap/**",
        "http://localhost:*/**"
    ]
  },
```

Apply new `scopes` and `role-templates` to lock down your Catalog service;
```JSON
  "scopes": [
    {
      "name": "$XSAPPNAME.capuser",
      "description": "CAP Project Generated role scope"
    }
  ],
  "role-templates": [
    {
      "name": "capuser",
      "description": "CAP Project Generated role template",
      "scope-references": ["$XSAPPNAME.capuser"],
      "attribute-references": []
    }
  ],
```

## Step 4: Apply security to Catalog Service

Edit `srv` -> `cat-service.cds` and replace `@requires: 'authenticated-user'` with `@(requires: 'capuser')`. 
