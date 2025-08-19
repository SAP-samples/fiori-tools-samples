# Exposing an SAPUI5 Library from an On-Premise System

You can consume an SAPUI5 library from an On-Premise system by configuring the `ui5.yaml` file in your project to include the On-Premise system to expose the SAPUI5 library. This is useful when the specific SAPUI5 version you want to use is not available on the SAPUI5 CDN network. 


# Prerequisites
- The SAPUI5 library must be accessible from the On-Premise system.
- The On-Premise system must be reachable from the environment where the SAPUI5 application is running. In this example, it is SAP Business Application Studio using the Cloud Connector.
- The SAPUI5 version is not available on the SAPUI5 CDN network. For example, https://ui5.sap.com/1.71.53 returns a HTTP 404 Not Found response. For a full list of available versions, see [SAPUI5 Versions](https://ui5.sap.com/versionoverview.html).

# Configuration Steps

## Existing Setup

To start, you already have a `ui5.yaml` file in your project which points to an existing SAP BTP destination.

In this example, your SAP BTP destination is called `MyDestination` and the On-Premise system is reachable using the Cloud Connector and is configured as follows:

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
        ignoreCertError: false # If set to true, certificate errors will be ignored and self-signed certificates will be accepted.
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

## Duplicate the SAP BTP Destination

To expose the SAPUI5 library from the On-Premise system, duplicate the SAP BTP destination configuration in your SAP BTP subaccount and change the URL.

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

The SAP BTP destination `URL` is configured with the following path: `/sap/public/bc/ui5_ui5/1/`. This is the path where the SAPUI5 libraries are exposed from the On-Premise system. The path may differ depending on your On-Premise system configuration so check with your system administrator if this path is correct.

**Note:** `WebIDEUsage` is not required for this destination because it is not exposing any OData services and is only used to serve the SAPUI5 library.

## Validate Duplicated Destination

In SAP Business Application Studio, you can validate the duplicated destination: `MyDestination_ui5` by using the `curl` command to fetch the SAPUI5 library from the On-Premise system:

```bash
 curl 'https://mydestination_ui5.dest/resources/sap-ui-core.js' -X GET -i -H 'X-Csrf-Token: fetch' > output-tsk1.txt
```

You can review the generated `output-tsk1.txt` file to ensure the SAPUI5 library is accessible from the On-Premise system. The response should contain the SAPUI5 library content.

## Modify the `ui5.yaml` File

To allow the SAPUI5 library to be consumed from the On-Premise system, you need to modify the `ui5.yaml` file in your project to include the destination:

It's important that the `/test-resources` is updated to point to the SAPUI5 CDN, while the `/resources` path is updated to point to the On-Premise system destination. This allows you to use the SAPUI5 library from the On-Premise system while still being able to access test resources from the SAPUI5 CDN. You should choose the version that is the closest to the version you are using in your project.

```yaml
        ui5:
          version: ''
          paths:
            - path: /resources
              url: https://mydestination_ui5.dest
            - path: /test-resources
              url: https://ui5.sap.com/<valid-UI5-version>
```

For an example of the entire `ui5.yaml` file, see the following code sample:

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
              url: https://ui5.sap.com/1.71.76                
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

### License
Copyright (c) 2009-2025 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.


