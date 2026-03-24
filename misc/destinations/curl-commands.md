# Testing SAP BTP Destinations with curl

## Overview

This guide provides sample `curl` commands for testing SAP BTP destination connectivity from a terminal in SAP Business Application Studio (BAS). Use these commands to verify that your destination is reachable and returning expected responses before using it with SAP Fiori tools or Service Center.

> **Note**: The `curl` commands in this guide use the `<destination-name>.dest` URL format, which is only accessible from within SAP Business Application Studio. These commands will not work from a local machine or external terminal.

For general destination configuration, see [Consuming and Validating SAP BTP Destinations to Support an OData XML Service](README.md).

## Prerequisites

- You are working in a terminal inside SAP Business Application Studio.
- Your SAP BTP destination is configured and active in your subaccount.
- `HTML5.DynamicDestination=true` and `WebIDEEnabled=true` are set on the destination.

### How `.dest` Routing Works

In BAS, the URL pattern `https://<destination-name>.dest/` is a proxy provided by the BAS environment. It resolves to the destination configured in your SAP BTP subaccount and forwards requests to the back-end system using the destination's URL and authentication settings. You do not call the back-end URL directly.

### Escaping `$` in the Shell

When using `curl` from a BAS terminal, the `$` sign must be escaped with a backslash (`\$`) to prevent the shell from interpreting it as a variable. For example, `$metadata` becomes `\$metadata` in the command.

### Authentication and `username:password`

> **Important**: The `-u username:password` flag in `curl` can only be used when the destination `Authentication` type is set to `NoAuthentication`. In this case, BAS forwards the credentials you provide in the `curl` command directly to the back-end system.
>
> For all other authentication types (`BasicAuthentication`, `OAuth2ClientCredentials`, `SAMLAssertion`, and so on), the credentials are stored in the SAP BTP destination configuration itself. BAS handles authentication automatically using those credentials, so passing `-u username:password` in the `curl` command has no effect and must not be used.

If you receive an HTTP 401 Unauthorized response and your destination is configured with `NoAuthentication`, append `-u username:password` to your `curl` command to pass credentials directly.

## Commands for `odata_abap` Destinations

Use these commands when your destination is configured with `WebIDEUsage=odata_abap`. The destination URL is always the base host only — BAS appends the ABAP catalog paths automatically.

Replace `<destination-name>` with the name of your SAP BTP destination.

### OData V2 Catalog

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection" > curl-v2catalog-output.txt 2>&1
```

### OData V4 Catalog

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata4/iwfnd/config/default/iwfnd/catalog/0002/ServiceGroups?\$expand=DefaultSystem(\$expand=Services)" > curl-v4catalog-output.txt 2>&1
```

### OData V2 Catalog with Credentials (NoAuthentication only)

If your destination uses `NoAuthentication` and you receive an HTTP 401, append credentials directly:

```bash
curl -L -vs -i -u "username:password" -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection" > curl-v2catalog-output.txt 2>&1
```

> **Note**: These catalog endpoints are only available on ABAP systems. Calling them against a non-ABAP destination (such as a third-party OData service) returns an HTTP 404 Not Found error, which is expected.

## Commands for `odata_gen` Destinations (Partial)

Use these commands when your destination is configured with `WebIDEUsage=odata_gen` and no `WebIDEAdditionalData=full_url` property. The destination URL is the base host only, and you append the full service path in the `curl` command.

Replace `<destination-name>` with the name of your SAP BTP destination and adjust the service path to match your back-end service.

### Service Document

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/v2/northwind/northwind.svc/" > curl-service-output.txt 2>&1
```

### Service Metadata

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/v2/northwind/northwind.svc/\$metadata" > curl-metadata-output.txt 2>&1
```

### Entity Set

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/v2/northwind/northwind.svc/Customers" > curl-entityset-output.txt 2>&1
```

### With Credentials (NoAuthentication only)

If your destination uses `NoAuthentication` and you receive an HTTP 401, append credentials directly:

```bash
curl -L -vs -i -u "username:password" -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/v2/northwind/northwind.svc/\$metadata" > curl-metadata-output.txt 2>&1
```

How the URL is constructed: the destination URL (`https://services.odata.org`) is combined with the path you append in the `curl` command (`/v2/northwind/northwind.svc/`) to form the complete back-end request: `https://services.odata.org/v2/northwind/northwind.svc/`.

## Commands for `odata_gen` Destinations (Full URL)

Use these commands when your destination is configured with `WebIDEUsage=odata_gen` and `WebIDEAdditionalData=full_url`. The destination URL already contains the complete service path, so you do not append a service path in the `curl` command.

Replace `<destination-name>` with the name of your SAP BTP destination.

### Service Document

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/" > curl-service-output.txt 2>&1
```

### Service Metadata

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/\$metadata" > curl-metadata-output.txt 2>&1
```

### Entity Set

```bash
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/Customers" > curl-entityset-output.txt 2>&1
```

### With Credentials (NoAuthentication only)

If your destination uses `NoAuthentication` and you receive an HTTP 401, append credentials directly:

```bash
curl -L -vs -i -u "username:password" -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/\$metadata" > curl-metadata-output.txt 2>&1
```

Notice that the service path is not required in these commands because it is already included in the destination URL configured in your SAP BTP subaccount.

## Interpreting the Response

The following table maps common HTTP error codes to likely causes and next actions when running `curl` against an SAP BTP destination.

| HTTP Status | Likely Cause | Next Action |
|---|---|---|
| **HTTP 200** | Success | Review the response body to confirm the expected data is returned. |
| **HTTP 401 Unauthorized** | Missing or invalid credentials | If `Authentication=NoAuthentication`, add `-u username:password` to your `curl` command. For all other authentication types, verify the credentials stored in the destination configuration in SAP BTP cockpit. |
| **HTTP 403 Forbidden** | User is authenticated but not authorised | Check user roles and authorisations on the back-end system. Verify that the CSRF token header (`X-CSRF-Token: Fetch`) is included. Confirm the endpoint is not blocked by a firewall or access policy. |
| **HTTP 404 Not Found** | Incorrect service path or service not active | Verify the service path appended in the `curl` command matches the actual back-end service. Confirm the service is active and exposed on the back-end system. For `odata_abap` destinations called against a non-ABAP system, HTTP 404 is expected. |
| **HTTP 407 Proxy Authentication Required** | Proxy or Cloud Connector misconfiguration | If `ProxyType=OnPremise`, verify the Cloud Connector configuration. Check the Virtual Host Mapping and Access Control settings. See the [on-premise troubleshooting guide](../onpremise/README.md) for detailed steps. |
| **HTTP 502 Bad Gateway** | Request timed out before the back-end responded | Ensure `HTML5.Timeout` is set to a minimum of `60000` ms in the destination configuration. Increase the value further if the back-end system is slow to respond. |
| **HTTP 503 Service Unavailable** | Back-end system is unreachable or unavailable | If `ProxyType=OnPremise`, [investigate the Cloud Connector configuration and connectivity](../onpremise/README.md#validate-connectivity). Verify the Virtual Host Mapping, Access Control settings, and Cloud Connector availability. See the [on-premise troubleshooting guide](../onpremise/README.md) for detailed steps. |
| **Timeout / No Response** | Network route unavailable or `HTML5.Timeout` too low | Verify the back-end system is reachable. Check Cloud Connector availability if using `ProxyType=OnPremise`. Consider increasing `HTML5.Timeout` in the destination configuration. |

For persistent issues, run the Environment Check tool in BAS and attach the generated zip file to your support ticket. See [Reporting Issues](README.md#reporting-issues) for the full checklist.

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
