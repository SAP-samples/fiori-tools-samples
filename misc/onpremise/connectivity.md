# Connectivity

This page covers how to configure the SAP BTP destination and the Cloud Connector, validate that your on-premise back-end is reachable, and resolve connectivity failures.

Table of Contents

- [Choosing an Authentication Type](#choosing-an-authentication-type)
- [Cloud Connector Configuration](#cloud-connector-configuration)
- [SAP BTP Destination](#sap-btp-destination)
- [Validate Connectivity](#validate-connectivity)
- [Quick Checks](#quick-checks)
- [Enable Cloud Connector Trace Logging](#enable-cloud-connector-trace-logging)
- [Known Issues](#known-issues)
- [Additional Resources](#additional-resources)

---

## Choosing an Authentication Type

SAP BTP on-premise destinations support several authentication types. The right choice depends on your security requirements and landscape.

| Authentication Type | What it does | Recommended for |
|---|---|---|
| `NoAuthentication` | SAP BTP sends no credentials. The Cloud Connector forwards the request as-is. | Development or sandbox environments where the back-end is open or access is controlled at the network layer only |
| `BasicAuthentication` | A fixed technical username and password stored in the destination are sent with every request. | Non-productive landscapes where a shared technical user is acceptable |
| `PrincipalPropagation` | The logged-in user's identity is forwarded as a short-lived certificate through the Cloud Connector to the back-end. | All productive landscapes |

### Why Principal Propagation Is Recommended for Productive Landscapes

`NoAuthentication` and `BasicAuthentication` are supported and work technically, but they carry significant risks in productive environments:

- **No user-level audit trail.** With `NoAuthentication`, the back-end cannot identify which end user made a request: all requests arrive anonymously. With `BasicAuthentication`, all requests arrive under the same shared technical account. Neither approach gives you per-user authorization enforcement or a meaningful audit log.
- **Shared credentials are a liability.** A `BasicAuthentication` password stored in the destination is shared across every user and application that uses it. Rotating it requires updating the destination configuration and redeploying any bound applications. A compromise affects everyone simultaneously.
- **Least-privilege is impossible.** Back-end authorization roles (such as SAP S/4HANA object-level authorizations) are assigned to users. With a technical user, you either over-privilege (grant it everything) or under-privilege (break scenarios for some users). Principal propagation lets the back-end apply each user's own authorizations exactly.
- **Compliance requirements.** Many enterprise security policies and audits (SOX, ISO 27001, SAP security baselines) require that actions in back-end systems are traceable to individual users. Anonymous or shared-user access fails this requirement.

`PrincipalPropagation` solves all of these: the back-end sees the actual user, applies that user's roles, and can log the action against their identity—without storing any long-lived credentials in the destination configuration.

> **Recommendation:** Use `PrincipalPropagation` for all productive on-premise destinations. Reserve `BasicAuthentication` for non-productive landscapes only, and avoid `NoAuthentication` for any system that holds business data. See [Principal Propagation](./principal-propagation.md) for setup instructions.

---

## Cloud Connector Configuration

For more information about how to install and configure the Cloud Connector, see [Installation and Configuration of SAP Cloud Connector](https://blogs.sap.com/2021/09/05/installation-and-configuration-of-sap-cloud-connector).

The Cloud Connector must be:

- Running and connected to your SAP BTP subaccount.
- Configured with a virtual host mapping that points to your on-premise back-end host and port.
- Set up with access control entries that allow requests from SAP BTP to reach the mapped paths.

---

## SAP BTP Destination

You can import the [Cloud Connector destination](./cloudconnector) example into the SAP BTP cockpit. Below is an example of destination properties:

```ini
# SAP BTP Cloud Connector Destination Example
Type=HTTP
HTML5.DynamicDestination=true
Description=SAP Cloud Connector
Authentication=PrincipalPropagation
CloudConnectorLocationId=scloud
WebIDEEnabled=true
ProxyType=OnPremise
URL=http://my-internal-host:44330/
Name=MyOnPremiseDestination
WebIDEUsage=odata_abap
HTML5.Timeout=60000
```

Properties:

- `WebIDEUsage=odata_abap`: Exposes OData service catalogs to SAP Business Application Studio.
- `WebIDEEnabled=true`: Enables the destination for SAP Business Application Studio.
- `HTML5.Timeout`: The timeout duration in milliseconds. Example: `60000`.
- `HTML5.DynamicDestination=true`: Enables the destination to be dynamically resolved at runtime.
- `Authentication=PrincipalPropagation`: Forwards the end-user identity to the back-end. Recommended for productive landscapes. See [Principal Propagation](./principal-propagation.md).
- `CloudConnectorLocationId`: The Cloud Connector location configured in the subaccount. Required when multiple Cloud Connectors are registered.
- `URL`: The internal host and port mapped through the Cloud Connector. Update this to match your virtual host mapping.

---

## Validate Connectivity

Run the [Environment Check](../destinations/README.md#environment-check) in SAP Business Application Studio to validate the OData V2 and OData V4 catalog endpoints. The check produces an `envcheck-results.md` file with details on any failures.

Address any issues in the report before proceeding to [Deployment](./deployment.md).

You can also run a manual connection test from an SAP Business Application Studio terminal:

```bash
# Replace <destination-name> before executing
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/IWFND/CATALOGSERVICE;v=2?saml2=disabled" > curl-catalog-output.txt 2>&1
```

Review `curl-catalog-output.txt` to check for connectivity or authentication errors.

---

## Quick Checks

If connectivity fails, run these checks first:

- Is the Cloud Connector running and connected to the SAP BTP subaccount?
- Is the virtual host mapping (virtual host/port and back-end host/port) configured and active?
- Does the destination point to the correct `CloudConnectorLocationId`?
- Are the authentication settings in the destination and the back-end system aligned (such as principal propagation, SSL, and certificates)?
- Are firewalls or proxies blocking traffic between the Cloud Connector and the back-end? This often occurs when moving to production because the originating IPs change. See [SAP BTP IP ranges](https://help.sap.com/docs/bas/sap-business-application-studio/sap-business-application-studio-availability?locale=en-US#inbound-ip-address%20) for the addresses to allowlist.
- Can you access the back-end system directly from the Cloud Connector host using `curl` or a web browser?

If problems persist, follow the [trace logging](#enable-cloud-connector-trace-logging) steps below to gather logs and re-run the [Environment Check report](../destinations/README.md#environment-check).

---

## Enable Cloud Connector Trace Logging

### SAP Cloud Connector Trace Logs

> Only use trace logging for troubleshooting. This is not recommended in production on a long-term basis.

1. In the Cloud Connector UI: **Log In** > **Log and Trace Files** > **Edit**.
2. Set **Cloud Connector Loggers** to `ALL` and **Other Loggers** to `Information`.
3. Enable **Payload Trace** and ensure the correct subaccount is selected.
4. Reproduce the failing scenario and capture the following logs:
   - `ljs_trace.log` (Cloud Connector)
   - `scc_core.log` (if present)
   - `traffic_trace_<subaccount>_on_<region>.trc` (required)
   - `tunnel_traffic_trace_<subaccount>_on_<region>.trc` (if applicable)
5. After capturing logs, revert logging levels to avoid excessive log generation.

For more information, see [Monitoring, Logging, and Troubleshooting](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector-troubleshooting).

### ABAP Transaction Logs

If HTTP traffic is reaching the ABAP system but errors persist, review the ABAP transaction logs for more detailed error information. This is useful when the request is not being blocked by the Cloud Connector, a local firewall, or a proxy:

- Transaction code: `/IWFND/ERROR_LOG`
- Video guide: [OData Error Log Analysis](https://www.youtube.com/watch?v=Tmb-O966GwM)

If you do not see network traffic in the `traffic_trace_` logs, the most likely cause is that the Cloud Connector cannot establish a secure tunnel to the target system. This is often caused by a local firewall or proxy. For more information, see [Invalid proxy response status: 503 Service Unavailable](https://ga.support.sap.com/index.html#/tree/3046/actions/45995:48363:53594:63697:48366:52526).

---

## Known Issues

### OData V4 Catalog Service Not Available

**Symptoms:** HTTP 401, HTTP 403, or HTTP 404 responses. The error may contain the string `/IWFND/CONFIG not published`.

**Resources:**

- [OData V4 Service Catalog Tutorial](https://community.sap.com/t5/technology-blog-posts-by-sap/odata-v4-service-catalog/ba-p/13477068)
- [OData V4 Service Catalog Documentation](https://help.sap.com/docs/SAP_NETWEAVER_AS_ABAP_752/68bf513362174d54b58cddec28794093/326e64dbe120405e852046afa5de2235.html)
- [SAP Note 2954378 - No authorization to access service group '/IWNGW/NOTIFICATION'](https://launchpad.support.sap.com/#/notes/0002954378)
- [SAP Note 2928752 - How to activate ICF nodes in SAP Gateway](https://launchpad.support.sap.com/#/notes/0002928752)

### OData V2 Catalog Returns HTTP 404

- [SAP Note 2489898 - HTTP 404 Not Found for /IWFND/CATALOGSERVICE and Cannot load tile on SAP Fiori Launchpad](https://me.sap.com/notes/0002489898)

---

## Additional Resources

- [Whitelisting SAP BTP IP ranges](https://help.sap.com/docs/bas/sap-business-application-studio/sap-business-application-studio-availability?locale=en-US#inbound-ip-address%20): requires support from your IT admin team
- [Understanding SAP BTP Destinations](https://learning.sap.com/learning-journeys/administrating-sap-business-technology-platform/using-destinations)
- [Create SAP BTP Destinations](https://developers.sap.com/tutorials/cp-cf-create-destination.html)
- [Cloud Connector Explained](https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-connector-explained-in-simple-terms/ba-p/13547036)

---

**Next:** [Deployment](./deployment.md)—deploy your app to the ABAP on-premise repository.
