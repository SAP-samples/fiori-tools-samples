# Sample Configurations to improve ABAP deployment task

Please refer to the following guide for more info;

https://www.npmjs.com/package/@sap/ux-ui5-tooling

## Developers Note

SAP Cloud Transport Management (CTMS) for deployment is a recommended solution for ABAP deployment. While manual deployments or the use of CLI tools are supported, the CI/CD process may run in non-SAP DevOps platforms, but deployment to SAP BTP should go through CTMS. 

You can integrate external CI/CD pipelines, eg. Azure DevOps or CircleCI, to CTMS via APIs or using [GitHub Actions](https://github.com/marketplace/actions/deploy-to-sap-btp-with-ctms). 

With CTMS, you have full control on the changes going through the landscape, and have a proper audit log to trace them if required.

For more information, please refer to the following resources;

https://community.sap.com/t5/technology-blog-posts-by-sap/sap-btp-runtimes-my-personal-considerations-and-preferences-on-cloud/ba-p/14129510


## Using environment variables using .env file

Create a .env file in the root of your SAPUI5 project and append the following content;
```
XYZ_USER=myusername
XYZ_PASSWORD=mypassword
```

Update `ui5-deploy.yaml` with the `credentials` node;

```YAML
    configuration:
      yes: true
      failFast: true
      target:
        url: https://XYZ.sap-system.corp:44311
        client: 200        
      credentials:
        username: env:XYZ_USER
        password: env:XYZ_PASSWORD
```

When you run `npm run deploy` or `npm run undeploy`, it will pick up the environment variables.

Setting `env:` for the credentials is only required if you want to configure a `.env` file to load environment variables, otherwise you export them as normal;

```bash
export XYZ_USER='~username'
export XYZ_PASSWORD='~password''
```

`ui5-deploy.yaml` is then updated as 
```YAML
      credentials:
        username: XYZ_USER
        password: XYZ_PASSWORD
```
Or if using CLI params;
```bash
--username XYZ_USER --pasword XYZ_PASSWORD
```

Additional note, if you are using a CI/CD pipeline, then you can make further updates to your `ui5-deploy.yaml` as shown above;
- Add `yes: true` to bypass the `Yes` confirmation prompt
- Add `failFast: true` to immediately exit the process if any exception is thrown, for example, a typical scenario is where authentication might fail and you want to disable the credentials prompts from being shown. This will exit with code of `1`.

## Create Transport Request (TR) on the fly

If you want to create TR on the fly during each deployment task, append the `REPLACE_WITH_TRANSPORT` bookmark to your `ui5-deploy.yaml` configuration;
```YAML
      app:
        name: /TEST/SAMPLE_APP
        package: /TEST/UPLOAD
        transport: REPLACE_WITH_TRANSPORT
```

Using the TR `REPLACE_WITH_TRANSPORT` bookmark for undeployment works as well, for example, when you run `npm run undeploy` it will also creat a TR on the fly.

## CI/CD Pipeline

Generate CLI commands for your CI/CD pipeline;

```bash
npx fiori deploy --url https://your-env.hana.ondemand.com --name 'SAMPLE_APP' --package 'MY_PACKAGE' --transport 'REPLACE_WITH_TRANSPORT' --archive-path 'archive.zip' --username 'env:XYZ_USER' --password 'env:XYZ_PASSWORD' --noConfig --failFast --yes
```

## Generate ZIP archive

You have two options;

### Option 1

Remove `--archive-path 'archive.zip'` from the CLI params and allow the `dist` folder to be archived on the fly during deployment 

### Option 2 

Generate an `archive.zip` manually which will require some updates to your existing project; update `package.json` with a new `devDependency`;
```json
"ui5-task-zipper": "latest"
```

Update `ui5.yaml` with a new `builder` task;
```YAML
builder:
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateVersionInfo
      configuration:
        archiveName: "archive"          
        keepResources: true
```

When `npm run build` is now executed, it will generate a new archive file `./dist/arhive.zip`.

You can also create a new configuration file called `build.yaml` to handle this specific task;

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: <your-project-name>
type: application  
builder:
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateVersionInfo
      configuration:
        archiveName: "archive"          
        keepResources: true
```
Run the CLI command using the new `build.yaml` configuration;

```bash
npx ui5 build --config build.yaml
```
which will generate a new archive file `./dist/arhive.zip`.

Optionally, update your `scripts` in `package.json` with the new command;

```json
"archive": "ui5 build --config build.yaml"
```

Using either flow, you can see the new custom task `ui5-task-zipper` being executed;
```bash
info ProjectBuilder Preparing build for project project1
info ProjectBuilder   Target directory: ./dist
info Project 1 of 1: ❯ Building application project project1...
info project1 › Running task escapeNonAsciiCharacters...
info project1 › Running task replaceCopyright...
info project1 › Running task replaceVersion...
info project1 › Running task minify...
info project1 › Running task generateFlexChangesBundle...
info project1 › Running task generateComponentPreload...
info project1 › Running task ui5-task-zipper...
info ProjectBuilder Build succeeded in 199 ms
info ProjectBuilder Executing cleanup tasks...
```

Note: please update your scripts to reflect the new target folder to `./dist/archive.zip`.

## Additional Notes

1. For deployment purposes, appending additional headers is not supported via CLI or `ui5-deploy.yaml` configurations.












