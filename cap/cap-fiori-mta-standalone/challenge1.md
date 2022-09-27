Deploy CAP Project using a Fiori UI and in-memory database with FLP support

- Dev space is created using SAP Fiori or Full Stack Development
- Ensure CDS is installed by runnging `npm i -g @sap/cds-dk`
- Determine a valid MTA id, for example `standaloneCAPProject`

1. Run the following commands;
```bash
cds init standaloneCAPProject
cd  standaloneCAPProject/
cds add samples
cds add mta
```

2. The base of your CAP project is now configured

3. Open `package.json` and make the following changes;

a. move `"sqlite3": "^5.0.4"` from `devDependencies` to `dependencies`

b. add the following to `dependencies`
```JSON
  "@sap/xsenv": "^3.1.0",
  "@sap/xssec": "^3.2.0",
  "passport": "^0.4.1"
```

c. Connecting CDS to the SQLite in-memory database, open `package.json` and include the following `cds` node;
```JSON
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

4. Open `mta.yaml` and make the following changes to `build-parameters`;
```YAML
build-parameters:
  before-all:
   - builder: custom
     commands:
      - npm install --production
      - npx -p @sap/cds-dk cds build --production
      - cp -r db/data gen/srv/srv/data
```

5. Open `srv/cat-service.cds`, append the following UI annotations;
```JSON
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

6. Run `npm install`

7. Run `cds watch` to validate everything is working, follow the new tab to validate your catalog service is running

8. Right click mta and select `Create MTA Module from Template`
	- Select `Approuter Configuration`
	- Select your HTML5 application runtime - select `Standalone Approuter`
	- Do you want to add authentication? - `Yes`
	- Do you plan to add a UI? - `Yes`
	- Select Next

9. Right click mta and select `Create MTA Module from Template`
	- Select `SAP Fiori Application`
	- Select your application type and floor plan
	- Select `Use a Local CAP Project` and point to your new CAP project
	- Select OData Service
	- Select Main entity
	- Enter a unique project name i.e. `mystandalonecapproject`
	- Select Add deployment configuration to MTA project - `Yes` (will have detected your mta.yaml already generated)
  - Select Add FLP configuration - `Yes`
  - Select Next
	- Select Please choose the target - `Cloud Foundry`
	- Select `None` for your destination
  - Select Semantic Object? - `MyStandaloneCapProject`
  - Select Action? - `display`
  - Select Title? - `The Title of my Standalone App`
  - Select Finish

10. Open app/mystandalonecapproject/xs-app.json, add the following route as the first route in the list;
```JSON	
    {
      "authenticationType": "none",
      "csrfProtection": false,
      "source": "^/catalog/",
      "destination": "cap-launchpad"
    },	
```

11. Open `mta.yaml` make the following changes

- Update the existing module standaloneCAPProject-srv to reflect the following attributes

```YAML
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
	
- add the following destination resource `standaloneCAPProject-destination-service`

```YAML
- Authentication: NoAuthentication
  Name: cap-launchpad
  ProxyType: Internet
  Type: HTTP
  URL: ~{srv-api/srv-url}
  HTML5.DynamicDestination: true
  HTML5.ForwardAuthToken: true
```

- also, add the following `requires` node

```YAML
requires:
  - name: srv-api 
```

Full example:
```YAML
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

12. Your application is now ready for deployment or local development    

To deploy the application to Cloud Foundry

1. Open the <mta-id>-approuter folder and open `package.json`, change `"@sap/approuter": "10.5.1"` to `"@sap/approuter": "11.5.0"` and change `"node": "^10.0.0 || ^12.0.0"` to `"node": ">= 14.0.0"` this is to support node v16 on Cloud Foundry

Using SAP Business Application Studio;

2. Right click the mta.yaml and select `Build MTA Project`, this will generate an mtar archive

3. Right click the mtar in the `mta_archives` folder and select `Deploy MTA Archive`, if not logged into Cloud Foundry it will fail

Using VSCode

1. Run the following command
```BASH
npm run build && npm run deploy
```