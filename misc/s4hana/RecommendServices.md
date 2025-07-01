# Standard and Custom OData Services in SAP S/4HANA

# Prerequisites
- Ensure you have access to the SAP S/4HANA system.
- You have the necessary authorizations to access the OData services and the Catalog service.
- You have the URL of your SAP S/4HANA system, replace `https://my111111.s4hana.cloud.sap:443` with your system's URL.

# Step1. Calling the Catalog service;

Open your browser or a REST client and invoke the following URL:

```plaintext
https://my111111.s4hana.cloud.sap/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/
```

This is the general catalog that should list all active and registered OData services in your system, both standard (SAP-delivered) and custom.

# Step2. Review the XML response

The XML response will look similar to the following:

```xml
<app:service xml:base="https://my111111.s4hana.cloud.sap:443/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/" xml:lang="en" xmlns:app="http://www.w3.org/2007/app" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">
	<app:workspace>
		<atom:title type="text">Data</atom:title>
		<app:collection href="Annotations" sap:content-version="2" sap:deletable="false" sap:updatable="false">
			<atom:title type="text">Annotations</atom:title>
			<sap:member-title>Annotation</sap:member-title>
		</app:collection>
		<app:collection href="Vocabularies" sap:addressable="false" sap:content-version="2" sap:deletable="false" sap:updatable="false">
			<atom:title type="text">Vocabularies</atom:title>
			<sap:member-title>Vocabulary</sap:member-title>
		</app:collection>
		<app:collection href="ServiceTypeForHUBServices" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false">
			<atom:title type="text">ServiceTypeForHUBServices</atom:title>
			<sap:member-title>ServiceTypeForHUBService</sap:member-title>
			<atom:link href="ServiceTypeForHUBServiceCollection/OpenSearchDescription.xml" rel="search" title="searchServiceTypeForHUBServiceCollection" type="application/opensearchdescription+xml"/>
		</app:collection>
		<app:collection href="ServiceCollection" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false">
			<atom:title type="text">ServiceCollection</atom:title>
			<sap:member-title>Service</sap:member-title>
			<atom:link href="ServiceCollection/OpenSearchDescription.xml" rel="search" title="searchServiceCollection" type="application/opensearchdescription+xml"/>
		</app:collection>
		<app:collection href="ServiceNames" sap:addressable="false" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:updatable="false">
			<atom:title type="text">ServiceNames</atom:title>
			<sap:member-title>ServiceName</sap:member-title>
		</app:collection>
		<app:collection href="TagCollection" sap:content-version="2" sap:creatable="false" sap:updatable="false">
			<atom:title type="text">TagCollection</atom:title>
			<sap:member-title>Tag</sap:member-title>
		</app:collection>
		<app:collection href="EntitySetCollection" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:updatable="false">
			<atom:title type="text">EntitySetCollection</atom:title>
			<sap:member-title>EntitySet</sap:member-title>
		</app:collection>
		<app:collection href="CatalogCollection" sap:content-version="2">
			<atom:title type="text">CatalogCollection</atom:title>
			<sap:member-title>Catalog</sap:member-title>
		</app:collection>
		<app:collection href="RecommendedServiceCollection" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false">
			<atom:title type="text">RecommendedServiceCollection</atom:title>
			<sap:member-title>RecommendedService</sap:member-title>
			<atom:link href="RecommendedServiceCollection/OpenSearchDescription.xml" rel="search" title="searchRecommendedServiceCollection" type="application/opensearchdescription+xml"/>
		</app:collection>
		<app:collection href="ScopedServiceCollection" sap:content-version="2" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false">
			<atom:title type="text">ScopedServiceCollection</atom:title>
			<sap:member-title>ScopedService</sap:member-title>
			<atom:link href="ScopedServiceCollection/OpenSearchDescription.xml" rel="search" title="searchScopedServiceCollection" type="application/opensearchdescription+xml"/>
		</app:collection>
	</app:workspace>
	<atom:link href="https://my111111.s4hana.cloud.sap:443/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/" rel="self"/>
	<atom:link href="https://my111111.s4hana.cloud.sap:443/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/" rel="latest-version"/>
</app:service>
```

Based on this XML response, only the `RecommendedServiceCollection` is available.

# Step3. Why you're only seeing custom services in RecommendedServiceCollection?

Invoke the following API;
```plaintext
https://my111111.s4hana.cloud.sap/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/ServiceCollection
```

Do you see standard services here?

If yes, then the standard services exist and are active, but they are not showing up in `RecommendedServiceCollection` due to the filtering logic. This is expected behavior for some standard services.

SAP restricts visibility in `RecommendedServiceCollection` to services relevant for Fiori Launchpad apps that are `recommended`, typically those assigned to your business catalogs.

Please note:
Custom services are typically created in your namespace and attached explicitly to roles.
Standard services only show up if they are part of apps included in roles assigned to your user.

# Step4. How can I add a standard service?

Not all standard SAP services from the Fiori App Reference Library are activated or available in your tenant by default.

You can review the SAP Fiori Apps Reference Library https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/homePage

To include a standard service (e.g., from the Grants Management library) in the RecommendedServiceCollection, follow these steps:

1. Identify the Required Business Catalog 
   - Use the SAP Fiori Apps Reference Library to locate the app or service you need. 
   - Example: For Grants Management, the catalog might be SAP_PSM_BC_MON_GRNTRESP_PC.

2. Select a Suitable Business Role 
   - Choose an existing business role assigned to your user (e.g. BR_DEVELOPER) in your S/4HANA Cloud tenant.

3. Add the Catalog to the Role 
   - In the Maintain Business Roles app:
   - Open the role (e.g. BR_DEVELOPER). 
   - Add the catalog SAP_PSM_BC_MON_GRNTRESP_PC. 
   - Save and activate the role.

4. Service Appears in RecommendedServiceCollection
   - After role activation, the services associated with the added catalog will be included in the /sap/opu/odata/IWFND/CATALOGSERVICE;v=2/RecommendedServiceCollection endpoint for your user.

# Step5. How can I consume a standard service if it's not listed in RecommendedServiceCollection?

If a standard service is not listed in the `RecommendedServiceCollection`, you can still consume it by following these steps using SAP Fiori tools on Business Application Studio:

Please ensure you have the necessary authorizations to access the service and followed the prerequisites mentioned in [./README.md](./README.md#Prerequisites).

1. Your SAP BTP destination is configured correctly to point to your S/4HANA system, lets assume the destination is called `S4HANA_CLOUD`.
2. You have the service name you want to consume, for example, `ZGRANTS_MANAGEMENT_SRV`, service path is `/sap/opu/odata/sap/`, you can obtain these values from the `/ServiceCollection` XML response as shown above.
3. Open the SAP Fiori tools generator, select your template, select `Connect to an OData Service` and enter the following details:

```plaintext
https://S4HANA_CLOUD.dest/sap/opu/odata/sap/ZGRANTS_MANAGEMENT_SRV
```
where `S4HANA_CLOUD` is the destination name you configured in your SAP BTP cockpit appended to `.dest` to allow you call your destination directly.

4. Follow the prompts to generate your application, and it will consume the standard service directly.

