# Sample Configurations to improve ABAP deployment task

Please refer to the following guide for more info;

https://www.npmjs.com/package/@sap/ux-ui5-tooling

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
      failfast: true
      target:
        url: https://XYZ.sap-system.corp:44311
        client: 200        
      credentials:
        username: env:XYZ_USER
        password: env:XYZ_PASSWORD
```

When you run `npm run deploy` or `npm run undeploy`, it will pickup the environment variables.

Setting `env:` for the credentials is only required if you want to configure a `.env` file to load environment variales, otherwise you just export them as normal;

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
- Add `yes: true` to by-pass the `Yes` confirmation prompt
- Add `failfast: true` to immediately exist the process if any exception is thrown, for example, a typical scenario is where authentication might fail and you want to disable the credentials prompts from being shown. This will exit with code of `1`.

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
npx fiori deploy --url https://your-env.hana.ondemand.com --name 'SAMPLE_APP' --package 'MY_PACKAGE' --transport 'REPLACE_WITH_TRANSPORT' --archive-path 'archive.zip' --username 'env:XYZ_USER' --pasword 'env:XYZ_PASSWORD' --noConfig --failfast --yes
```

## Generate archive

If you bypass the `ui5-deploy.yaml` process by specifing `--noConfig` then you need to add another task to generate this for you;

Update `package.json` with a new `devDependency`;
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

When `npm run build` is now executed, it will generate a new file called `arhive.zip` in the default `dist` folder.

You can see the new custom task being executed;
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












