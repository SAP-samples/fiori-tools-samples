# Handling Self-Signed SSL Certificates in SAP Fiori Tools

For more information on SSL certificates, please refer to the [SAP Help](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/4b318bede7eb4021a8be385c46c74045.html) and the [SAP Community](https://community.sap.com/topics/fiori-tools).

# Overview

During application generation, invalid security certificate errors may occur when the system the user is connected to is using SSL to support secure HTTPS traffic. In some cases, the certificate is generated using a local certificate authority that is unknown to the user operating system. If this happens, the SAP Fiori application generator will by default reject the connection request and report an error. We recommend that you fix this error by installing the required certificates using the instructions below. 

The instructions below are applicable where the security certificate is valid, but using a local certificate authority that is unknown to the operating system. If the SSL cert is invalid, such as an expired cert, wrong host or unable to verify leaf signature, please contact your administrator. In these cases, they cannot be resolved by SAP Fiori tools.

You can optionally choose to ignore the error and continue generation with the invalid certificate (not recommended).

# Security Risk

Ignoring certificate errors `ignoreCertError: true` is a significant security issue because it bypasses the TLS/SSL certificate validation process, which is a crucial security mechanism for secure communications. This is problematic because:

- Man-in-the-Middle (MITM) Vulnerability
- Malicious Site Access
- Broken Chain of Trust
- Security Policy Violations

Ignoring certificate errors might seem like a quick fix for development issues, but it's equivalent to disabling a critical security feature, leaving your application and users vulnerable to serious attacks.

# Installing Certificates

`NODE_EXTRA_CA_CERTS` is an environment variable that allows Node.js to recognize additional Certificate Authority (CA) certificates beyond the default trusted CAs. It's designed for:

1. Working with self-signed certificates
1. Using internal enterprise CAs not included in Node.js's default trust store
1. Adding custom CAs without disabling the entire certificate validation system

## Export the Certificate

To get a better understanding of how CA certificates work, please refer to the [Node.js documentation](https://nodejs.org/api/cli.html#node_extra_ca_certsfile).

1. Navigate to the website using Edge, Chrome, or Firefox
1. Click on the padlock icon in the address bar
1. View certificate details:
1. In Chrome: Click "Connection is Not Secure" → "Certificate (Invalid)"
1. In Edge: Click "Certificate (Invalid)"
1. In Firefox: Click "Connection Not Secure" → "More Information" → "View Certificate"
1. Export/Save the certificate:
   1. In Chrome/Edge: Go to "Details" tab → "Copy to File" → Follow the Certificate Export Wizard -> save as .pem
   1. In Firefox: Go to "Details" → "Export" → Choose a location and save as .crt or .cer

## Install the Certificate to support VSCode

### Microsoft Windows

1. Right-click the CA certificate file and select `Install Certificate`. 
1. Follow the prompts to add the certificate to the trust store either for the current user only or for all users logging onto this computer.

### MacOS.

1. Right-click the CA certificate file. 
1. Select Open With and navigate to Keychain Access. 
1. Select System as the keychain to import into.

### Install the Certificate to support Node.js

Set the environment variable `NODE_EXTRA_CA_CERTS` to the path of the CA certificate file, file extensions don't matter (.pem, .crt, .cer, .cert all work). This will allow Node.js and applications dependent on Node.js to use the custom CA certificate for SSL connections.

Refer to `Configuring Environment Variables` below for instructions on how to set environment variables, quick sample;

#### Windows
```powershell
# Set for current session only
$env:NODE_EXTRA_CA_CERTS = "C:\path\to\your\certificate.crt"

# Verify it's set correctly
$env:NODE_EXTRA_CA_CERTS
```

#### MacOS/Linux

```bash
# Set for current session only
export NODE_EXTRA_CA_CERTS=path/to/your/certificate.crt
```

# Globally Bypassing SSL Certificate Validation (Not Recommended)

`NODE_TLS_REJECT_UNAUTHORIZED` is an environment variable in Node.js that controls SSL/TLS certificate validation behavior. 

Setting `NODE_TLS_REJECT_UNAUTHORIZED=0` has the same security risks to `ignoreCertError`, please refer to the `Security Risk` section above.

```bash
# WARNING: Only for development environments
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

When set to 1 (default): Node.js verifies SSL/TLS certificates and rejects connections with invalid, expired, or self-signed certificates
When set to 0: Certificate validation is disabled, allowing connections to servers with invalid certificates

Please only use this as a temporary solution only during development.

# Disable SSL Validation - Local Preview

Sample `ui5.yaml` configuration;

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

Typically, `ignoreCertError: false` is the default configuration when you create a new project using the SAP Fiori tools. This means that the server will validate the SSL certificate of the backend system. If you are using a self-signed certificate, you may need to set `ignoreCertError: true` to bypass the validation.

# Disable SSL Validation - Deploying to ABAP

Sample `ui5-deploy.yaml` configuration;

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

Typically, `ignoreCertError: false` is the default configuration when you create a new project using the SAP Fiori tools. This means that the server will validate the SSL certificate of the backend system. If you are using a self-signed certificate, you may need to set `ignoreCertError: true` to bypass the validation.

# Configuring Environment Variables

## Windows

### Manually

1. Right-click on Start or This PC → Select Properties
1. Click on Advanced system settings in the sidebar
1. Click the Environment Variables button at the bottom 
1. In the top section ("User variables for [username]"), click New 
1. For "Variable name" enter: NODE_TLS_REJECT_UNAUTHORIZED 
1. For "Variable value" enter: 0 
1. Click OK

### Windows powershell

For all users;

```powershell
# Set permanently system-wide, set for all users (requires admin privileges)
[Environment]::SetEnvironmentVariable("NODE_TLS_REJECT_UNAUTHORIZED", "0", "Machine")

# This requires restarting any open PowerShell/cmd windows or applications
```

For logged in current user;

```powershell
# Set permanently for current user
[Environment]::SetEnvironmentVariable("NODE_TLS_REJECT_UNAUTHORIZED", "0", "User")

# This requires restarting any open PowerShell/cmd windows or applications
```

For the current session only;

```powershell
# Set for current session only
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'

# Verify it's set correctly
$env:NODE_TLS_REJECT_UNAUTHORIZED

# Run a Node.js script with the variable set just for this execution
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'; node your-script.js
```

## MacOS/Linux

For all users;

```bash
# For all users (requires sudo/root)
sudo sh -c 'echo "NODE_TLS_REJECT_UNAUTHORIZED=0" >> /etc/environment'

# This requires logging out and back in or rebooting
```

For logged in current user;

```bash
# For Bash (add to ~/.bashrc or ~/.bash_profile)
echo 'export NODE_TLS_REJECT_UNAUTHORIZED=0' >> ~/.bashrc

# For Zsh (add to ~/.zshrc)
echo 'export NODE_TLS_REJECT_UNAUTHORIZED=0' >> ~/.zshrc

# Apply changes immediately
source ~/.bashrc  # or source ~/.zshrc for Zsh
```

For the current session only;

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
