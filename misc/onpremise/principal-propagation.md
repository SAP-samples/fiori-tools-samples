# Principal Propagation

Principal propagation is the recommended authentication method for productive on-premise landscapes. It forwards the logged-in user's identity from SAP BTP through the Cloud Connector to the back-end system, so the back end sees the actual user, not a generic technical account.

**When to use it:** Any time your back-end system needs to know which user is making a request, for example, for authorization checks, audit logs, or personalization.

Table of Contents

- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
1. [Configure Trust in the SAP BTP Subaccount](#1-configure-trust-in-the-sap-btp-subaccount)
2. [Configure the Cloud Connector](#2-configure-the-cloud-connector)
3. [Configure the Back-End System](#3-configure-the-back-end-system)
4. [Configure the SAP BTP Destination](#4-configure-the-sap-btp-destination)
5. [Validate Principal Propagation](#5-validate-principal-propagation)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## How It Works

1. The user authenticates with SAP BTP (for example, using SAML or OIDC).
2. SAP BTP issues a short-lived client certificate representing the user.
3. The Cloud Connector presents this certificate to the on-premise back end.
4. The back end maps the certificate subject to a local user account and processes the request under that identity.

The key requirement is **trust**: the back end must trust the Cloud Connector's system certificate, and the Cloud Connector must be allowed to assert user identities on behalf of SAP BTP.

---

## Prerequisites

- You have an SAP BTP subaccount configured with Cloud Foundry runtime.
- You have Cloud Connector installed, running, and connected to the subaccount.
- You have admin access to the SAP BTP cockpit, the Cloud Connector UI, and the ABAP back-end system using transactions `STRUST`, `SM59`, `SU01`, and `SU10`.
- You have confirmed that connectivity works and the back end is reachable before configuring PP. For more information, see [Connectivity](./connectivity.md).

---

## 1. Configure Trust in the SAP BTP Subaccount

The subaccount certificate is used by the Cloud Connector to identify itself to the back end. Download it and import it into the back end.

1. In the SAP BTP cockpit, navigate to **Connectivity** > **Cloud Connectors**.
2. Select your connected Cloud Connector and expand the **Subaccount** details.
3. Under **Subaccount Certificate**, download the certificate (`.pem` or `.crt` format).

Keep this certificate and import it into the back end in [Configure the Back-End System](#3-configure-the-back-end-system).

---

## 2. Configure the Cloud Connector

Enable the Cloud Connector to issue short-lived user certificates for principal propagation.

1. In the Cloud Connector UI, navigate to **Configuration** > **On Premise** > **Principal Propagation**.
2. Under **Subject Pattern**, configure how the user identity is encoded in the certificate subject. A common pattern is:

   ```text
   CN=${name}
   ```

   Where `${name}` maps to the SAP BTP user's login name. Adjust the pattern to match how users are identified in your back-end system (for example, by email, by SAP user ID, or by a custom attribute).

3. Set the **Certificate Validity**, that is, the lifetime of the short-lived certificate. A value of 60 seconds is typical for production.

4. Save the configuration.

For the full list of available subject pattern variables, see [Configuring Principal Propagation](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation).

---

## 3. Configure the Back-End System

The ABAP back end must trust the Cloud Connector's system certificate and map the incoming certificate subject to a local user.

### a. Import the System Certificate into STRUST

1. In the ABAP system, open the `STRUST` transaction.
2. Navigate to **SSL server Standard**, or the relevant SSL node for your system.
3. Import the subaccount certificate downloaded in [Configure Trust in the SAP BTP Subaccount](#1-configure-trust-in-the-sap-btp-subaccount) into the certificate list.
4. Save and activate.

### b. Configure User Mapping

The back end must map the certificate subject (for example, `CN=john.doe@company.com`) to a local ABAP user.

For systems using **SAP Logon Tickets** or **X.509 client certificates**:

1. Open the `SU01` transaction for individual users or `SU10` for mass changes.
2. In the user record, go to the **Logon Data** tab.
3. Set **User Type** to `System` or `Dialog` as appropriate.
4. Under the **SNC** tab, set the **SNC Name** to match the principal propagation subject pattern configured in the Cloud Connector. For example:

   ```text
   p:CN=john.doe@company.com, OU=SAP BTP, O=SAP SE
   ```

   The exact format depends on your Cloud Connector subject pattern. Check the Cloud Connector trace log (see [Troubleshooting](#troubleshooting)) to see the exact subject string being presented.

---

## 4. Configure the SAP BTP Destination

Set the destination authentication to `PrincipalPropagation`:

```ini
Type=HTTP
Authentication=PrincipalPropagation
ProxyType=OnPremise
URL=http://my-internal-host:44330/
Name=MyOnPremiseDestination
CloudConnectorLocationId=scloud
WebIDEEnabled=true
WebIDEUsage=odata_abap
HTML5.DynamicDestination=true
HTML5.Timeout=60000
```

> Do not set `User` or `Password` properties when using `PrincipalPropagation`, as authentication is handled using a certificate.

---

## 5. Validate Principal Propagation

Run the [Environment Check](../destinations/README.md#environment-check) in SAP Business Application Studio. The check runs a catalog request using the configured destination and confirms the end-user identity is forwarded correctly.

You can also test manually from an SAP Business Application Studio terminal:

```bash
# Replace <destination-name> before executing
curl -L -vs -i -H "X-CSRF-Token: Fetch" "https://<destination-name>.dest/sap/opu/odata/IWFND/CATALOGSERVICE;v=2?saml2=disabled" > curl-pp-output.txt 2>&1
```

A successful response returns HTTP 200 with a catalog payload. If you see HTTP 401 or HTTP 403, proceed to [Troubleshooting](#troubleshooting).

---

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| HTTP 401 on catalog request | Trust not established between Cloud Connector and back end | Re-check `STRUST` — confirm the subaccount certificate is imported and active |
| HTTP 403 on catalog request | User mapped but missing back-end authorization | Check `S_SERVICE` and `S_RFC` authorizations for the mapped user in `SU53` |
| `SNC name not found` error in logs | Subject pattern mismatch between Cloud Connector and back-end SNC name | Enable [trace logging](./connectivity.md#enable-cloud-connector-trace-logging) and compare the presented subject with the `SNC Name` in `SU01` |
| HTTP 200 but wrong user in back end | Subject pattern maps to wrong attribute | Adjust subject pattern in Cloud Connector and confirm back-end `SNC Name` values match |

For step-by-step log analysis, see [How to Troubleshoot Cloud Connector Principal Propagation over HTTPS](https://help.sap.com/docs/SUPPORT_CONTENT/appservices/3361376259.html#HowtotroubleshootCloudConnectorprincipalpropagationoverHTTPS-Checkingthelogs,followtheclientcertificate).

---

## Additional Resources

- [Setting up Principal Propagation](https://community.sap.com/t5/technology-blog-posts-by-sap/setting-up-principal-propagation/ba-p/13510251)
- [Configuring Principal Propagation](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation)
- [How to Troubleshoot Cloud Connector Principal Propagation over HTTPS](https://help.sap.com/docs/SUPPORT_CONTENT/appservices/3361376259.html#HowtotroubleshootCloudConnectorprincipalpropagationoverHTTPS-Checkingthelogs,followtheclientcertificate)

---

**Previous:** [Deployment](./deployment.md): deploy your app to the ABAP on-premise repository.

**Next:** [SAPUI5 Library from On-Premise](./ui5-onpremise.md): consume a pinned SAPUI5 version from your on-premise system.
