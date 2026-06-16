# Switch from SQLite to HANA

## Prerequisites

- You have an SAP HANA Cloud database set up and running in your cloud space. For more information, see [Create an SAP HANA Database Project](https://developers.sap.com/tutorials/hana-cloud-create-db-project.html).

## Implementation

1. Update the `cds` node in your `package.json` file:
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
2. Locate the `managedAppCAPProject-db-deployer` module in your `mta.yaml` file and update the `path` from `gen/db` to `db`.

3. Using the "SAP HANA PROJECTS" view, bind the `managedAppCAPProject-db` to your existing deployed HDI-shared instance and publish the sample data.

For more information about binding and publishing using your local CAP project, see [Building hana-opensap-cloud-2020 Part 2: Project Setup and First DB Build](https://blogs.sap.com/2021/01/21/building-hana-opensap-cloud-2020-part-2-project-setup-and-first-db-build/).

4. Stop any existing `cds instances` and re-run `cds watch`.

The `db` now uses `hana` as its data source:
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
5. Click `Open in New Tab` to open your application.

6. Validate your application works as expected and re-run the build and deploy steps to push your changes to Cloud Foundry.

If you encounter an error with the connection to your database, try copying the generated `.env` file from the `db` folder to the root of your project:
```bash
cp db/.env .
```