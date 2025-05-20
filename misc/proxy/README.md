# Defining Proxy Settings for SAP Fiori Tools

# Overview

In some environments, you may need to configure proxy settings to allow SAP Fiori tools to connect to external services or resources. This is particularly relevant when working in corporate networks or environments with strict firewall rules.

# Prerequisites
- Ensure you have the necessary permissions to modify environment variables on your system.
- Confirm with your IT Admin if proxy settings are required for your network environment, for example, in some instances internal networks may not require proxy settings.

# Setting Up Proxy Environment Variables using UI5 YAML Configuration

The `ui5.yaml` file is used to configure the proxy settings for SAP Fiori tools. You can define the proxy settings in the `ui5.yaml` file as follows:

```yaml
- name: fiori-tools-proxy
  afterMiddleware: compression
  configuration:
    proxy: https://myproxy.com:8443
    backend:
    - path: /sap
      url: https://my.backend.com:1234
```

If you need to pass credentials, then the proxy URL should be in the format `http://user:password@proxyserver:port`.

Refer to [@sap/ux-ui5-tooling](https://www.npmjs.com/package/@sap/ux-ui5-tooling#providing-proxy-configuration) API guide for more information.

# Setting Up Proxy Environment Variables

The typical `HTTP_PROXY` settings used for connecting to a proxy server include:

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

# Setting Up Proxy Environment Variables for Deployment

Refer to the [SAP Axios Extension](https://github.com/SAP/open-ux-tools/tree/main/packages/axios-extension#proxy-support) for more information on setting up proxy environment variables for deployment.

To enable support for TLS (Transport Layer Security), enable the `HTTPS_PROXY` environment variable, as shown;

```bash
export HTTPS_PROXY=<YOUR-PROXY:PORT>
```

To support credentials in the proxy URL, you can set the `HTTPS_PROXY` environment variable to include the username and password in the URL. For example:

```bash
export HTTPS_PROXY=http://user:password@proxy.domain.com:3128
```

If your password contains special characters, ror example, if your password is `p@s#w0rd`, you would append single quotes `'p@s#w0rd'`:
```bash
export HTTPS_PROXY=http://myusername:'p@s#w0rd'@proxy.domain.com:3128
```
