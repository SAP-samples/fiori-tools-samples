## Add Authentication to Catalog API Using XSUAA

1. Update the `authenticationType` from `none` to `xsuaa` in the `app->feproject-ui->xs-app.json` file, as shown:
```json
    {
      "authenticationType": "xsuaa",
      "csrfProtection": false,
      "source": "^/catalog/",
      "destination": "cap-catalog-api"
    },
```
2. Add the following `dependencies` in the `package.json` file, as shown:
```json
        "@sap/xsenv": "^4.2.0",
        "@sap/xssec": "^3.6.0",
        "passport": "^0.6.0"
```
3. Enable authentication in the service catalog by adding `@requires: 'authenticated-user'` to `srv->cat-service.cds`, as shown:
```cds
@requires: 'authenticated-user'
service CatalogService {
    @readonly entity Books as projection on my.Books;
}
```

4. Open the `mta.yaml` file and make the following changes to support xsuaa:
  - Add `appname` to the `parameters` node, as shown:

```yaml
parameters:
  deploy_mode: html5-repo
  enable-parallel-deployments: true
  appname: mycapproject-unique
```

The `appname` must be unique to your subaccount.

  - Update the `managedAppCAPProject-srv` module to support authentication by adding `uaa_managedAppCAPProject` and removing the reference to `srv-api` by switching to the static URL using `host`, as shown:
```yaml
- name: managedAppCAPProject-srv
  type: nodejs
  path: gen/srv
  requires:
  - name: managedAppCAPProject-db
  - name: uaa_managedAppCAPProject
  parameters:
    buildpack: nodejs_buildpack
    host: ${appname}
  build-parameters:
    builder: npm-ci
    ignore: [".env", "node_modules/"]
 ```
  - Update the catalog API endpoint exposed in the `managedAppCAPProject-destination-service` resource and update the `URL` path to `https://${appname}.${default-domain}`, as shown:
```yaml
  - Authentication: NoAuthentication
    Name: cap-catalog-api
    ProxyType: Internet
    Type: HTTP
    URL: https://${appname}.${default-domain}
    HTML5.DynamicDestination: true
    HTML5.ForwardAuthToken: true    
```

The `URL` path is referenced by the static `host` you generated.

  - Remove the `srv-api` reference in the `managedAppCAPProject-destination-service` resource.
  
  The service API is no longer applicable since we are using a static host.

- Validate the catalog API works and re-run the build and deploy steps to push your changes to Cloud Foundry.

Your Catalog API is now secured with XSUAA authentication.
