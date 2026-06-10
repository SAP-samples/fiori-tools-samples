# Handling Self-Signed SSL Certificates in SAP Fiori Tools

## Overview

During application generation, invalid security certificate errors may occur when the connected system uses SSL to support secure HTTPS traffic. In some cases, the certificate uses a local certificate authority that is unknown to the user operating system. If this occurs, the SAP Fiori application generator rejects the connection request and reports an error by default. We recommend that you fix this error by installing the required certificates using the following instructions.

The following instructions are applicable where the security certificate is valid but uses a local certificate authority that is unknown to the operating system. If the SSL cert is invalid, such as an expired cert, incorrect host, or unable to verify a leaf signature, contact your administrator. They cannot be resolved by SAP Fiori tools.

You can optionally choose to ignore the error and continue generation with the invalid certificate, though this is not recommended.

For more information about SSL certificates, see the [SAP Help Portal](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/4b318bede7eb4021a8be385c46c74045.html) and the [SAP Community](https://pages.community.sap.com/topics/fiori-tools).

## Prerequisites

> **Important**: Any scripts or commands in this guide that modify environment variables, system certificates, or operating system settings may change the behaviour of your system or operating system. Ensure all such changes are carried out with the authorization of your IT support team. Additionally, ensure any HTML5 application source files you modify are under source control before making changes.

- You are aware that certificates are normally validated against a DNS hostname. If you connect using an IP address, the certificate must explicitly list that IP in the Subject Alternative Name (SAN) field. If the SAN does not include the IP, most clients, such as browsers, Node.js, and Java, reject the connection with a hostname mismatch error. Public Certificate Authorities generally do not issue certificates for IPs, so this typically requires a self-signed or private CA.

## Security Risk

Ignoring certificate errors `ignoreCertError: true` is a significant security issue because it bypasses the TLS/SSL certificate validation process, which is a crucial security mechanism for secure communications. This is problematic because:

- Man-in-the-middle (MITM) vulnerability
- Malicious site access
- Broken chain of trust
- Security policy violations

Ignoring certificate errors may seem like a quick fix for development issues, but it's equivalent to disabling a critical security feature, which leaves your application and users vulnerable to serious attacks.

## Installing Certificates

`NODE_EXTRA_CA_CERTS` is an environment variable that allows Node.js to recognize additional Certificate Authority (CA) certificates beyond the default trusted CAs. It's designed for:

- Working with self-signed certificates
- Using internal enterprise CAs not included in Node.js's default trust store
- Adding custom CAs without disabling the entire certificate validation system

### Export the Certificate

1. Navigate to the website using Edge, Chrome, or Firefox.
2. Click on the padlock icon in the address bar.
3. View certificate details:
   - In Chrome: Click "Connection is Not Secure": "Certificate (Invalid)"
   - In Edge: Click "Certificate (Invalid)"
   - In Firefox: Click "Connection Not Secure": "More Information": "View Certificate"
1. Export and save the certificate:
   - In Chrome or Edge: Go to "Details" tab: "Copy to File": Follow the Certificate Export Wizard: save as `.pem`
   - In Firefox: Go to "Details": "Export": Choose a location and save as `.crt` or `.cer`

For more information about CA certificates, see the [Node.js documentation](https://nodejs.org/api/cli.html#node_extra_ca_certsfile).

### Install the Certificate to Support VS Code

#### Microsoft Windows

1. Right-click the CA certificate file and select `Install Certificate`.
2. Follow the prompts to add the certificate to the trust store either for the current user only or for all users that log on to this computer.

#### macOS

1. Right-click the CA certificate file.
2. Select Open With and navigate to Keychain Access.
3. Select System as the keychain to import into.

### Install the Certificate to Support Node.js

Set the `NODE_EXTRA_CA_CERTS` environment variable to the path of the CA certificate file, file extensions don't matter, such as `.pem`, `.crt`, `.cer`, and `.cert`. This allows Node.js and applications dependent on Node.js to use the custom CA certificate for SSL connections.

For more information about setting environment variables, see [Configuring Environment Variables](#configuring-environment-variables), for example:

#### Windows

```powershell
# Set for current session only
$env:NODE_EXTRA_CA_CERTS = "C:\path\to\your\certificate.crt"

# Verify it's set correctly
$env:NODE_EXTRA_CA_CERTS
```

#### macOS and Linux

```bash
# Set for current session only
export NODE_EXTRA_CA_CERTS=path/to/your/certificate.crt
```

## Globally Bypassing SSL Certificate Validation (Not Recommended)

`NODE_TLS_REJECT_UNAUTHORIZED` is an environment variable in Node.js that controls SSL/TLS certificate validation behavior.

Setting `NODE_TLS_REJECT_UNAUTHORIZED=0` has the same security risks as `ignoreCertError`. For more information, see [Security Risk](#security-risk).

```bash
# WARNING: Only for development environments
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

When set to 1 (default): Node.js verifies SSL/TLS certificates and rejects connections with invalid, expired, or self-signed certificates.
When set to 0: Certificate validation is disabled, which allows connections to servers with invalid certificates.

Only use this as a temporary solution during development.

## Disable SSL Validation - Local Preview

Sample `ui5.yaml` file configuration:

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: myproject
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
          - path: /here
            url: http://localhost
```

Typically, `ignoreCertError: false` is the default configuration when you create a new project using SAP Fiori tools. This means that the server validates the SSL certificate of the back-end system. If you use a self-signed certificate, you must set `ignoreCertError: true` to bypass the validation.

## Disable SSL Validation - Deploying to ABAP

Sample `ui5-deploy.yaml` file configuration:

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: myproject
type: application
builder:
  customTasks:
    - name: deploy-to-abap
      afterTask: generateCachebusterInfo
      configuration:
        ignoreCertError: true # If set to true, certificate errors will be ignored. E.g. self-signed certificates will be accepted
        target:
          url: https://myhost:44380
          client: '110'
        app:
          name: Z_Sample_App
          description: Sample App
          package: Z_SAMPLE_PACKAGE
          transport: TR123456
        exclude:
          - /test/
  resources:
    excludes:
      - /test/**
      - /localService/**
```

Typically, `ignoreCertError: false` is the default configuration when you create a new project using SAP Fiori tools. This means that the server validates the SSL certificate of the back-end system. If you are using a self-signed certificate, you must set `ignoreCertError: true` to bypass the validation.

## Configuring Environment Variables

### Windows

#### Manually

1. Right-click on Start or This PC and select Properties.
2. Click on Advanced system settings in the sidebar.
3. Click the Environment Variables button at the bottom.
4. In the "User variables for [username]" section at the top, click New.
5. Set "Variable name" to `NODE_TLS_REJECT_UNAUTHORIZED`.
6. Set "Variable value" to `0`.
7. Click OK.

#### Windows PowerShell

For all users:

```powershell
# Set permanently system-wide, set for all users (requires admin privileges)
[Environment]::SetEnvironmentVariable("NODE_TLS_REJECT_UNAUTHORIZED", "0", "Machine")

# This requires restarting any open PowerShell/cmd windows or applications
```

For the logged-in user:

```powershell
# Set permanently for current user
[Environment]::SetEnvironmentVariable("NODE_TLS_REJECT_UNAUTHORIZED", "0", "User")

# This requires restarting any open PowerShell/cmd windows or applications
```

For the current session only:

```powershell
# Set for current session only
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'

# Verify it's set correctly
$env:NODE_TLS_REJECT_UNAUTHORIZED

# Run a Node.js script with the variable set just for this execution
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'; node your-script.js
```

### macOS and Linux

For all users:

```bash
# For all users (requires sudo/root)
sudo sh -c 'echo "NODE_TLS_REJECT_UNAUTHORIZED=0" >> /etc/environment'

# This requires logging out and back in or rebooting
```

For logged in current user:

```bash
# For Bash (add to ~/.bashrc or ~/.bash_profile)
echo 'export NODE_TLS_REJECT_UNAUTHORIZED=0' >> ~/.bashrc

# For Zsh (add to ~/.zshrc)
echo 'export NODE_TLS_REJECT_UNAUTHORIZED=0' >> ~/.zshrc

# Apply changes immediately
source ~/.bashrc  # or source ~/.zshrc for Zsh
```

For the current session only:

```bash
# Set for current session only
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Verify it's set correctly
echo $NODE_TLS_REJECT_UNAUTHORIZED

# Run a Node.js script with the variable set just for this execution
NODE_TLS_REJECT_UNAUTHORIZED=0 node your-script.js

# Or for any other command that uses Node.js
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start
```

### Validate TLS Connectivity (Node.js)

To isolate TLS and certificate issues from IDEs or third-party tooling, such as VS Code, SAP Fiori tools, or corporate proxies, run the following command directly in a terminal. This validates whether the Node.js runtime can establish an HTTPS connection using the configured CA trust chain.

#### Option 1: Check Status Code Only

```bash
node -e "require('https').get('https://your-host', res => { console.log(res.statusCode); }).on('error', err => console.error(err))"
```

Replace `https://your-host` with a specific and reachable endpoint.

#### Option 2: Check Status Code and Response Body

```bash
node -e "require('https').get('https://your-host', res => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', data)); }).on('error', err => console.error(err))"
```

Replace `https://your-host` with a specific and reachable endpoint.

How to interpret the result:

- HTTP status code is printed, such as 200, 401, or 403:
  TLS handshake succeeded and the CA certificate is trusted by Node.js.
- Error such as self signed certificate, unable to verify the first certificate, or similar:
  Node.js does not trust the issuing CA. The root or intermediate CA must be added to the Node trust store, for example using `NODE_EXTRA_CA_CERTS`, or installed at the OS level.
- This command bypasses higher-level tools and confirms whether the issue is at the Node.js TLS layer and not application logic.
- Ensure any required environment variables, such as `NODE_EXTRA_CA_CERTS`, are set before running the command.

Note, this is not a software bug, if the endpoint is standards-compliant but the runtime does not trust the CA, the responsibility is on the consuming team, not the provider.

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
