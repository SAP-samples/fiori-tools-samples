# Consuming an SAPUI5 Library from an On-Premise System

You can consume an SAPUI5 library from an on-premise system by configuring the `ui5.yaml` file in your project to point to a destination that exposes the library. This is useful when the specific SAPUI5 version you need is not available on the SAPUI5 CDN.

Table of Contents

- [Prerequisites](#prerequisites)
- [Existing Setup](#existing-setup)
- [Duplicate the SAP BTP Destination](#duplicate-the-sap-btp-destination)
- [Validate the Duplicated Destination](#validate-the-duplicated-destination)
- [Modify the ui5.yaml File](#modify-the-ui5yaml-file)

---

## Prerequisites

- The SAPUI5 library is accessible from the on-premise system.
- The on-premise system is reachable from SAP Business Application Studio using the Cloud Connector. See [Connectivity](./connectivity.md) if not yet configured.
- The SAPUI5 version you need is not available on the CDN. For example, `https://ui5.sap.com/1.71.53` returns HTTP 404. For a full list of available versions, see [SAPUI5 Versions](https://ui5.sap.com/versionoverview.html).

---

## Existing Setup

You already have a `ui5.yaml` file that points to an existing SAP BTP destination. In this example, the destination is called `MyDestination` and is configured as follows:

```json
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

Your `ui5.yaml` points to the UI5 CDN and the destination:

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

---

## Duplicate the SAP BTP Destination

Create a second destination that points to the SAPUI5 library path on the on-premise system:

```json
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

The `URL` includes the path `/sap/public/bc/ui5_ui5/1/` where SAPUI5 libraries are exposed on the on-premise system. Confirm this path with your system administrator — it may differ depending on your system configuration.

> `WebIDEUsage` is not required for this destination because it exposes the SAPUI5 library only, not an OData service.

---

## Validate the Duplicated Destination

From an SAP Business Application Studio terminal, confirm the library is accessible:

```bash
curl -L 'https://mydestination_ui5.dest/resources/sap-ui-core.js' -X GET -i -H 'X-Csrf-Token: fetch' > output-tsk1.txt
```

Review `output-tsk1.txt` — a successful response contains the SAPUI5 library content.

---

## Modify the ui5.yaml File

Update `ui5.yaml` to serve `/resources` from the on-premise destination and `/test-resources` from the CDN:

```yaml
        ui5:
          version: ''
          paths:
            - path: /resources
              url: https://mydestination_ui5.dest
            - path: /test-resources
              url: https://ui5.sap.com/<valid-UI5-version>
```

For the full `ui5.yaml`, see the example below:

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

Notes:

- The `version` property is set to an empty string to prevent the tooling from rewriting the SAPUI5 paths to include a version number.
- `/resources` and `/test-resources` point to different locations intentionally — the on-premise system serves the pinned library version, while the CDN serves test resources for a supported version.

---

**Previous:** [Principal Propagation](./principal-propagation.md)  
**Raising a ticket?** See the [Support Checklist](./support-checklist.md).

---

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache License 2.0. See [LICENSE](../../LICENSES/Apache-2.0.txt) for details.
