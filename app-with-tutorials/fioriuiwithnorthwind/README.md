## Application Details
A Fiori UI application using a managed approuter supporting destination instance local preview.

## Prerequisites

- Only supported on Business Application Studio
- You are logged into your Cloud Foundry subaccount
- Does not support SAP BTP services like `xsuaa` so any scoped routes are not enforced

## Setup Project

There is no `package-lock.json` attached, to the latest versions are used;
```bash
npm i
```

Build the mta;
```bash
npm run build:mta
```
Deploy the mta, assumes you are already logged into Cloud Foundry;
```bash
npm run deploy
```
Spin up your local preview using the destination instance `fioriuiwithnorthwind-destination-service`;
```bash
npm run start
```