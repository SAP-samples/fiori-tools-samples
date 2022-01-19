## Switch from SQLite to HANA
- HANA Cloud database is setup and running in your cloud space, refer to this [tutorial](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html)
- Update the `cds` node in your `package.json` to the following;
```json
    "cds": {
        "build": {
            "tasks": [
                {
                    "for": "hana",
                    "dest": "../db"
                },
                {
                  "for": "node-cf"
                }
              ]
            },
        "hana": {
            "deploy-format": "hdbtable"
            },
        "requires": {
            "db": {
              "kind": "hana"
            },
            "uaa": {
              "kind": "xsuaa"
            }
        }
  }
```
- Locate the `managedAppCAPProject-db-deployer` module in your `mta.yaml`, update the `path` from `gen/db` to `db`
- Using the SAP HANA PROJECTS view, bind the `managedAppCAPProject-db` to your existing deployed HDI-shared instance and publish the sample data generated for you, for more information on bind and publishing using your local CAP Project, follow this [blog post](https://blogs.sap.com/2021/01/21/building-hana-opensap-cloud-2020-part-2-project-setup-and-first-db-build/)
- Stop any existing `cds instances` and re-run `cds watch`, you will notice now the db is using hana as its datasource;
```bash
[cds] - connect using bindings from: { registry: '~/.cds-services.json' }
[cds] - connect to db > hana {
  certificate: '...',
  driver: 'com.sap.db.jdbc.Driver',
  hdi_password: '...',
  hdi_user: '5ZSJY7DA7WSR5I8ID2437IM15_DT',
  host: 'hostname',
  password: '...',
  port: '443',
  schema: '349D449AD914434',
  service_key_name: 'SharedDevKey',
  url: 'jdbc:sap://hostname',
  user: '349D449AD914434396E2631757'
}
[cds] - serving CatalogService { at: '/catalog' }
```
- Select `Open in New Tab` to open your application again
- Once everything is validated as working, re-run the build and deploy steps to push your changes to CF

If there is an error with the connection to the database, try copying the generated `.env` from the `db` folder to the root of your project;
```bash
cp db/.env .
```