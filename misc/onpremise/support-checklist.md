# Support Checklist

If connectivity or deployment issues persist after working through the troubleshooting steps, raise a support ticket. Use the component `BC-MID-SCC` for Cloud Connector issues or `CA-UX-IDE` for deployment issues.

Compile all required artifacts into a single zip file and attach it to the ticket.

---

## Required Artifacts

### SAP BTP Destination

- Screenshot of the destination in the SAP BTP cockpit (show all properties, including additional properties).

### Environment Check Report

- [Environment Check report](../destinations/README.md#environment-check) generated from SAP Business Application Studio.

### Cloud Connector Screenshots

Capture the following screens from the Cloud Connector UI:

- **Subaccount Overview:** Cloud Connector > Subaccount Overview > click the subaccount.
- **Virtual Host Mapping:** Cloud Connector > Cloud to On-Premise > select the virtual host mapping defined in the SAP BTP destination.
- **Access Control (edit view):** Cloud Connector > Cloud to On-Premise > Access Control > select the mapping > Actions > Edit (pencil icon).
- **Access Control (access policy):** Cloud Connector > Cloud to On-Premise > Access Control > select the mapping. Confirm **Access Policy** is set to **Path and All Sub-Paths** and the URL path is `/`. This may differ depending on your security requirements.
- **Check Availability result:** Cloud Connector > Cloud to On-Premise > Access Control > Actions > Check Availability.

### Cloud Connector Logs

Collected trace logs (see [Enable Cloud Connector Trace Logging](./connectivity.md#enable-cloud-connector-trace-logging)):

- `ljs_trace.log`
- `scc_core.log` (if present)
- `traffic_trace_<subaccount>_on_<region>.trc`
- `tunnel_traffic_trace_<subaccount>_on_<region>.trc` (if applicable)

### ABAP Transaction Logs

- Output from `/IWFND/ERROR_LOG` and `/IWFND/GW_CLIENT`. For more information, see the [SAP ABAP guide](https://www.youtube.com/watch?v=Tmb-O966GwM).

---

## Optional but Helpful

- `curl` output from an SAP Business Application Studio terminal when executing the connection test:

  ```bash
  # Replace <destination-name> before executing
  curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/IWFND/CATALOGSERVICE;v=2?saml2=disabled" > curl-catalog-output.txt 2>&1
  ```

- Clear reproduction steps with expected versus actual behavior.
- SAP BTP subaccount ID and region.

---

**Back to:** [Overview](./README.md)
