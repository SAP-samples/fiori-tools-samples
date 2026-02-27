## Defining Proxy Settings for SAP Fiori Tools

## Overview

In some environments, you may need to configure proxy settings to allow SAP Fiori tools to connect to external services or resources. This is particularly relevant when working in corporate networks or environments with strict firewall rules.

## Prerequisites

* Ensure you have the necessary permissions to modify environment variables on your system.
* Confirm with your IT Admin if proxy settings are required for your network environment, for example, in some instances internal networks may not require proxy settings.
* Unless specified by your IT Admin, do not use `https://` in the proxy URL, the default should be `http://` for the proxy URL.

### Setting Up Proxy Environment Variables using UI5 YAML Configuration

The `ui5.yaml` file is used to configure the proxy settings for SAP Fiori tools. You can define the proxy settings in the `ui5.yaml` file as follows:

```yaml
- name: fiori-tools-proxy
  afterMiddleware: compression
  configuration:
    proxy: http://myproxy.com:8443
    backend:
    - path: /sap
      url: https://my.backend.com:1234
```

If you need to pass credentials, then the proxy URL should be in the format `http://user:password@proxyserver:port`.

Refer to [@sap/ux-ui5-tooling](https://www.npmjs.com/package/@sap/ux-ui5-tooling#providing-proxy-configuration) API guide for more information.

## Setting Up Proxy Environment Variables

The typical settings used for connecting to a proxy server include:

```bash
export HTTP_PROXY=http://user:password@proxyserver:port
export HTTPS_PROXY=http://user:password@proxyserver:port
export NO_PROXY=localhost,127.0.0.1,internal.domain,.local
```

## Key Parts

`HTTP_PROXY`: For regular HTTP connections
`HTTPS_PROXY`: For secure HTTPS connections
`NO_PROXY`: Comma-separated list of hosts/domains that should bypass the proxy

Common variations:

Lowercase versions: http_proxy, https_proxy, no_proxy
Protocol-specific format: https:// instead of http:// for the HTTPS_PROXY URL
System-specific settings (Windows vs. Linux/macOS)

These environment variables are recognized by most applications and command-line tools to route network traffic through the specified proxy server. Again, you will need to confirm this with your IT Admin.

## Setting Up Proxy Environment Variables for Deployment

Refer to the [SAP Axios Extension](https://github.com/SAP/open-ux-tools/tree/main/packages/axios-extension#proxy-support) for more information on setting up proxy environment variables for deployment.

To enable support for TLS (Transport Layer Security), enable the `HTTPS_PROXY` environment variable, as shown;

```bash
export HTTPS_PROXY=<YOUR-PROXY:PORT>
```

To support credentials in the proxy URL, you can set the `HTTPS_PROXY` environment variable to include the username and password in the URL. For example:

```bash
export HTTPS_PROXY=http://user:password@proxy.domain.com:3128
```

If your password contains special characters, for example, if your password is configured as `p@s#w0rd`, then you will need to escape it `p%40s%23w0rd`:

```bash
export HTTPS_PROXY=http://myusername:p%40s%23w0rd@proxy.domain.com:3128
```

Refer to this link to translate special characters in URLs [URL Encode/Decode](https://www.url-encode-decode.com/).

If using an earlier version of [@sap/ux-ui5-tooling](https://www.npmjs.com/package/@sap/ux-ui5-tooling?activeTab=versions), for example v1.17.6, you may need to enable the patch proxy feature by setting the `TOOLSUITE_FEATURES` environment variable:

```bash
export TOOLSUITE_FEATURES=sap.ux.enablePatchProxy
```

The feature `sap.ux.enablePatchProxy` is enabled by default in the latest versions of the SAP Fiori tools, so you may not need to set this variable.

## Defining Proxy Settings

## Windows PowerShell Commands

Here are the PowerShell commands to set those proxy environment variables:

```powershell
$env:HTTP_PROXY = "http://user:password@proxyserver:port"
$env:HTTPS_PROXY = "http://user:password@proxyserver:port"
$env:NO_PROXY = "localhost,127.0.0.1,internal.domain,.local"
```

If you want to set these permanently for your user account (so they persist across PowerShell sessions), use:

```powershell
[Environment]::SetEnvironmentVariable("HTTP_PROXY", "http://user:password@proxyserver:port", "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://user:password@proxyserver:port", "User")
[Environment]::SetEnvironmentVariable("NO_PROXY", "localhost,127.0.0.1,internal.domain,.local", "User")
```

Or if you need them, set system-wide for all users (requires administrator privileges):

```powershell
[Environment]::SetEnvironmentVariable("HTTP_PROXY", "http://user:password@proxyserver:port", "Machine")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://user:password@proxyserver:port", "Machine")
[Environment]::SetEnvironmentVariable("NO_PROXY", "localhost,127.0.0.1,internal.domain,.local", "Machine")
```

If you are unfamiliar with PowerShell, you can also set these variables through the Windows GUI:

1. Right-click on "This PC" or "Computer" on the desktop or in File Explorer.
2. Select "Properties".
3. Click on "Advanced system settings" on the left sidebar.
4. In the System Properties window, click on the "Environment Variables" button.
5. In the Environment Variables window, you can add or edit the `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` variables under either "User variables" or "System variables".
6. Click "OK" to save your changes.
7. Restart any open command prompts or applications to ensure they pick up the new environment variables.

## MacOS/Linux

Here are the bash commands to set those proxy environment variables:

```bash
# Set for current session only
export HTTP_PROXY=http://user:password@proxyserver:port
export HTTPS_PROXY=http://user:password@proxyserver:port
export NO_PROXY=localhost,127.0.0.1,internal.domain,.local
```

If you want to set these permanently so they persist across terminal sessions, add them to your shell profile file:

```bash
echo 'export HTTP_PROXY=http://user:password@proxyserver:port' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://user:password@proxyserver:port' >> ~/.bashrc
echo 'export NO_PROXY=localhost,127.0.0.1,internal.domain,.local' >> ~/.bashrc
```

Then reload your profile:

```bash
source ~/.bashrc
```

## Validating Proxy Settings with curl

Use `curl` to verify proxy connectivity after configuration. `curl` is included by default on Windows 10 (1803+), Windows 11, macOS, and most Linux distributions.

## Basic Tests

Test proxy connection (same syntax on all platforms):

```bash
# Without authentication
curl -v --proxy http://proxyserver:port https://www.sap.com

# With authentication
curl -v --proxy http://user:password@proxyserver:port https://www.sap.com

# Using environment variables (HTTP_PROXY/HTTPS_PROXY)
curl -v https://www.sap.com

# Bypass proxy (macOS/Linux use single quotes, Windows use double quotes)
curl -v --noproxy "*" https://www.sap.com
```

Test backend connectivity:

```bash
curl -v --proxy http://proxyserver:port https://my.backend.com:1234/sap/opu/odata/
```

## Expected Results

**Success indicators:**

* HTTP 200 status or appropriate response code (401/403 for auth endpoints)
* Response headers from target server
* Verbose output shows proxy connection details

**Failure indicators:**

* Connection timeout or refused
* 407 status (proxy authentication required)
* SSL/TLS certificate errors
* DNS resolution failures

## Useful curl Options

```bash
curl -v --proxy http://proxyserver:port https://example.com          # Verbose output
curl -i --proxy http://proxyserver:port https://example.com          # Include headers
curl -k --proxy http://proxyserver:port https://example.com          # Skip SSL verification
curl --connect-timeout 10 --proxy http://proxyserver:port https://example.com  # Set timeout
```

## Validation Workflow

**macOS/Linux:**

```bash
export HTTP_PROXY=http://user:password@proxyserver:8080
export HTTPS_PROXY=http://user:password@proxyserver:8080
export NO_PROXY=localhost,127.0.0.1,.local

curl -v https://www.google.com                 # Test connectivity
curl -v https://my.backend.com/sap/opu/odata/  # Test backend
curl -v http://localhost:3000                  # Verify NO_PROXY
curl -v --noproxy '*' https://www.google.com   # Test without proxy
```

**Windows PowerShell:**

```powershell
$env:HTTP_PROXY = "http://user:password@proxyserver:8080"
$env:HTTPS_PROXY = "http://user:password@proxyserver:8080"
$env:NO_PROXY = "localhost,127.0.0.1,.local"

curl -v https://www.google.com
curl -v https://my.backend.com/sap/opu/odata/
curl -v http://localhost:3000
curl -v --noproxy "*" https://www.google.com
```

**Windows Command Prompt:**

```cmd
set HTTP_PROXY=http://user:password@proxyserver:8080
set HTTPS_PROXY=http://user:password@proxyserver:8080
set NO_PROXY=localhost,127.0.0.1,.local

curl -v https://www.google.com
curl -v https://my.backend.com/sap/opu/odata/
curl -v http://localhost:3000
curl -v --noproxy "*" https://www.google.com
```

## Troubleshooting

If curl fails:

1. Verify proxy address, port, and credentials (escape special characters in passwords)
2. Test proxy reachability: `telnet proxyserver port` or `nc -zv proxyserver port`
3. Check firewall rules for outbound connections to proxy
4. Verify NO_PROXY excludes internal hosts correctly
5. Review proxy server logs if accessible

### License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](../../LICENSES/Apache-2.0.txt) file.
