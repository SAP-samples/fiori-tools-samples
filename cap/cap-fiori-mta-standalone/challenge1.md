# Deploy CAP Project Using an SAP Fiori UI and In-Memory Database with SAP Fiori Launchpad Support

## Prerequisites

- You have a SAP Fiori or Full Stack Development dev space.
- You have CDS installed. Verify by running: `npm i -g @sap/cds-dk`.
- You have determined a valid MTA ID, for example `standaloneCAPProject`.

## Prepare Application

1. Run the following commands:
```bash
cds init standaloneCAPProject
cd  standaloneCAPProject/
cds add samples
cds add mta
```

You have created the base of your CAP project.

2. Open the `package.json` file and make the following changes:

   1. Move `"sqlite3": "^5.0.4"` from `devDependencies` to `dependencies`.

   2. Add the following to `dependencies`:
```json
  "@sap/xsenv": "^4.2.0",
  "@sap/xssec": "^3.6.0", 
  "passport": "^0.6.0"
```

   3. Open the `package.json` file and include the following `cds` node:
```json
    "cds": {
        "requires": {
            "db": {
            "kind": "sqlite",
            "credentials": {
              "database": ":memory:"
            }
         }
        },
        "features": {
          "in_memory_db": true
        }
    }    
```
   You have connected CDS to the SQLite in-memory database.

3. Open the `mta.yaml` file and make the following changes to `build-parameters`:
```yaml
build-parameters:
  before-all:
   - builder: custom
     commands:
      - npm install --production
      - npx -p @sap/cds-dk cds build --production
      - cp -r db/data gen/srv/srv/data
```

4. Open the `srv/cat-service.cds` file and append the following UI annotations:
```json
	annotate CatalogService.Books with @(
    UI : { 
        SelectionFields  : [
            title
        ],
        LineItem  : [
            { Value : ID },
            { Value : title }, 
            { Value : stock }                                   
        ],
     }
  ){
      ID @( title: 'ID' );    
      title @( title: 'Title' );
      stock @( title: 'Stock' );
  };
```

5. Run `npm install`.

6. Run `cds watch` and validate your catalog service is running in the new tab.

7. Right-click **mta** and select **Create MTA Module from Template**.
	- Select **Approuter Configuration**.
	- Select your HTML5 application runtime and select **Standalone Approuter**
	- Set **Do you want to add authentication?** to **Yes**.
	Set **Do you plan to add a UI?** to **Yes**.
	- Click **Next**.

8. Right-click **mta** and click **Create MTA Module from Template**.
	- Select `SAP Fiori Application`.
	- Select your application type and floorplan.
	- Select `Use a Local CAP Project` and point to your new CAP project.
	- Select OData Service.
	- Select Main entity.
	- Enter a unique project name, such as `mystandalonecapproject`.
	- Set **Add deployment configuration to MTA project** to `Yes` to use the `mta.yaml` file you have already generated.
  - Set **Add FLP configuration** to **Yes**.
  - Click **Next**.
	- Set **Please choose the target** to `Cloud Foundry`.
	- Set **Destination** to **None**.
  - Set **Semantic Object?** to `MyStandaloneCapProject`.
  - Set **Action** to **display**.
  - Set **Title?** to **The Title of my Standalone App**.
  - Click **Finish**.

9. Open the `app/mystandalonecapproject/xs-app.json` file and add the following route as the first route in the list:
```json	
    {
      "authenticationType": "none",
      "csrfProtection": false,
      "source": "^/catalog/",
      "destination": "cap-launchpad"
    },	
```

19. Open the `mta.yaml` file and make the following changes:

   - Update the existing `standaloneCAPProject-srv` module to reflect the following attributes:

```yaml
- name: standaloneCAPProject-srv
  type: nodejs
  path: gen/srv
  provides:
  - name: srv-api
    properties:
      srv-url: ${default-url}
  parameters:
    memory: 256M
    disk-quota: 1024M
    buildpack: nodejs_buildpack
  build-parameters:
    builder: npm-ci
```   		
	
   - Add the following destination resource: `standaloneCAPProject-destination-service`

```yaml
- Authentication: NoAuthentication
  Name: cap-launchpad
  ProxyType: Internet
  Type: HTTP
  URL: ~{srv-api/srv-url}
  HTML5.DynamicDestination: true
  HTML5.ForwardAuthToken: true
```

- Add the following `requires` node:

```yaml
requires:
  - name: srv-api 
```

Example:
```yaml
- name: standaloneCAPProject-destination-service
  type: org.cloudfoundry.managed-service
  requires:
    - name: srv-api
  parameters:
    config:
      HTML5Runtime_enabled: false
      init_data:
        instance:
          destinations:
          - Authentication: NoAuthentication
            Name: ui5
            ProxyType: Internet
            Type: HTTP
            URL: https://ui5.sap.com
          - Authentication: NoAuthentication
            Name: cap-launchpad
            ProxyType: Internet
            Type: HTTP
            URL: ~{srv-api/srv-url}
            HTML5.DynamicDestination: true
            HTML5.ForwardAuthToken: true  
          existing_destinations_policy: update
      version: 1.0.0
    service: destination
    service-name: standaloneCAPProject-destination-service
    service-plan: lite
```

20. Your application is now ready for local development and deployment.    

## Deploy Application to Cloud Foundry

- Open the `<mta-id>-approuter` folder and open the `package.json` file. Change `"@sap/approuter": "10.5.1"` to `"@sap/approuter": "11.5.0"` and change `"node": "^10.0.0 || ^12.0.0"` to `"node": ">= 14.0.0"` to support Node.js v16 on Cloud Foundry.

### Using SAP Business Application Studio

1. Right-click the `mta.yaml` file and click **Build MTA Project**. This generates an `mtar` archive.

3. Right-click the `mtar` archive in the `mta_archives` folder and click `Deploy MTA Archive`. Ensure you are logged into Cloud Foundry.

### Using VS Code

Run the following command:
```bash
npm run build && npm run deploy
```