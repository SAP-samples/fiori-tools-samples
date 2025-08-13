# Exposing an SAPUI5 Library from an On-Premise System

You want to consume a UI5 library from an on-premise system, for example, the specific UI5 version is no longer available on the UI5 CDN network. 


# Prerequisites
- The SAPUI5 library must be accessible from the On-Premise system.
- The On-Premise system must be reachable from the environment where the SAPUI5 application is running. In this example, it is SAP Business Application Studio using the Cloud Connector.

# Configuration Steps

## Existing setup

In most cases, you will have an existing `ui5.yaml` file in your project, pointing to an existing SAP BTP destination.

Let's assume, your SAP BTP destination is called `MyDestination` and the on-premise system is reachable via the Cloud Connector and is configured as follows;

```JSON
{
    "destination": {
        "Authentication": "NoAuthentication",
        "CloudConnectorLocationId": "MyCloudConnectorLocationId",
        "HTML5.DynamicDestination": "true",
        "HTML5.Timeout": "60000",
        "Name": "MyDestination",
        "ProxyType": "OnPremise",
        "Type": "HTTP",
        "URL": "http://my-internal-system.abc.internal:443",
        "WebIDEEnabled": "true",
        "WebIDEUsage": "odata_abap",
        "sap-client": "100"
    }
}
```

Your SAPUI5 HTML5 application is generated with a `ui5.yaml` configuration, pointing to the UI5 CDN and the destination `MyDestination`:

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: testproject
type: application
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ignoreCertError: false # If set to true, certificate errors will be ignored. E.g. self-signed certificates will be accepted
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com           
        backend:
          - path: /sap
            url: http://my-internal-system.abc.internal:443
            destination: MyDestination
    - name: fiori-tools-appreload
      afterMiddleware: compression
      configuration:
        port: 35729
        path: webapp
        delay: 300
    - name: fiori-tools-preview
      afterMiddleware: fiori-tools-appreload
      configuration:
        flp:
          theme: sap_fiori_3
```

## Duplicate the SAP BTP destination

To expose the UI5 library from the on-premise system, you can duplicate the SAP BTP destination configuration in your SAP BTP subaccount, the only change is, the URL, for example;

```JSON
{
    "destination": {
        "Authentication": "NoAuthentication",
        "CloudConnectorLocationId": "MyCloudConnectorLocationId",
        "HTML5.DynamicDestination": "true",
        "HTML5.Timeout": "60000",
        "Name": "MyDestination_ui5",
        "ProxyType": "OnPremise",
        "Type": "HTTP",
        "URL": "http://my-internal-system.abc.internal:443/sap/public/bc/ui5_ui5/1/",       
        "sap-client": "100"
    }
}
```

The SAP BTP destination `URL` is now configured with the following path: `/sap/public/bc/ui5_ui5/1/`. This is the path where the UI5 libraries are exposed from the on-premise system. This might different depending on your on-premise system configuration, so please check with your system administrator if this path is correct.

Also, `WebIDEUsage` is not required for this destination as it's not exposing any OData services and is only used to serve the UI5 library.

## Validate Duplicated Destination

In Business Application Studio, you can validate the duplicated destination `MyDestination_ui5` by using the `curl` command to fetch the UI5 library from the on-premise system;

```bash
 curl 'https://mydestination_ui5.dest/resources/sap-ui-core.js' -X GET -i -H 'X-Csrf-Token: fetch' > output-tsk1.txt
```

You can review the generated `output-tsk1.txt` file to ensure the UI5 library is accessible from the on-premise system. The response should contain the UI5 library content.

## Modify the `ui5.yaml` file

In order to allow the UI5 library to be consumed from the on-premise system, you need to modify the `ui5.yaml` file in your project to include the destination;

```yaml
        ui5:
          version: ''
          paths:
            - path: /resources
              url: https://mydestination_ui5.dest
            - path: /test-resources
              url: https://ui5.sap.com    
```

A working example of the `ui5.yaml` file would look like this:

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: testproject
type: application
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ignoreCertError: false # If set to true, certificate errors will be ignored and self-signed certificates will be accepted.
        ui5:
          version: ''
          paths:
            - path: /resources          
              url: https://mydestination_ui5.dest                    
            - path: /test-resources
              url: https://ui5.sap.com                
        backend:
          - path: /sap
            url: http://my-internal-system.abc.internal:443
            destination: mydestination
    - name: fiori-tools-appreload
      afterMiddleware: compression
      configuration:
        port: 35729
        path: webapp
        delay: 300
    - name: fiori-tools-preview
      afterMiddleware: fiori-tools-appreload
      configuration:
        flp:
          theme: sap_fiori_3
```

**Note the following:**
- The SAPUI5 `version` property is configured with an empty string. This prevents rewriting the SAPUI5 paths to include the version number because this is not required.
- The SAPUI5 paths `/test-resources` and `/resources` are configured to point to different locations.

The reason the SAP BTP destination was duplicated was to allow you to control the path to the SAPUI5 library. This can point to any URI that exposes the SAPUI5 library.
