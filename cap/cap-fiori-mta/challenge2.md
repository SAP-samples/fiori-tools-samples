## Add Authentication to Catalog API using XSUAA
- Update the `authenticationType` from `none` to `xsuaa`in `app->feproject-ui->xs-app.json`, as shown;
```json
    {
      "authenticationType": "xsuaa",
      "csrfProtection": false,
      "source": "^/catalog/",
      "destination": "cap-catalog-api"
    },
```
- Add the following `dependencies` in the root `package.json`
```json
        "@sap/xsenv": "^3.1.0",
        "@sap/xssec": "^3.2.0",
        "passport": "^0.4.1"
```
- Enable authentication on the service catalog, add `@requires: 'authenticated-user'` to `srv->cat-service.cds`, as shown;
```cds
@requires: 'authenticated-user'
service CatalogService {
    @readonly entity Books as projection on my.Books;
}
```

There are a number of MTA changes required to support xsuaa, open `mta.yaml` and make the following changes;
- Change 1 - Add `appname` to the `parameters` node, this can be something unique to your subaccount, as shown;
```yaml
parameters:
  deploy_mode: html5-repo
  enable-parallel-deployments: true
  appname: mycapproject-unique
```
- Change 2 - update the `managedAppCAPProject-srv` module to support authentication by adding `uaa_managedAppCAPProject` and removing the reference to `srv-api` by switching to the static URL using `host`, as shown;
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
- Change 3 - Update the catalog API endpoint exposed in the `managedAppCAPProject-destination-service` resource, update `URL` path to `https://${appname}.${default-domain}` which will now be referenced by a static hostname, generated in change 1;
```yaml
  - Authentication: NoAuthentication
    Name: cap-catalog-api
    ProxyType: Internet
    Type: HTTP
    URL: https://${appname}.${default-domain}
    HTML5.DynamicDestination: true
    HTML5.ForwardAuthToken: true    
```
- Change 4 - Remove the `srv-api` reference in the  `managedAppCAPProject-destination-service` resource, this service API is no longer applicable since we are using a static host now
- Once everything is validated as working, re-run the build and deploy steps to push your changes to CF
- Your Catalog API is now secured with XSUAA authentication