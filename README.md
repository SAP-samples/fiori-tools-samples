[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/fiori-tools-samples)](https://api.reuse.software/info/github.com/SAP-samples/fiori-tools-samples)

# SAP Fiori Tools Samples

A collection of sample projects demonstrating SAP Fiori elements and SAP Fiori tools capabilities. These samples are referenced in tutorials, blogs, and documentation to help developers learn and implement SAP Fiori applications.

## Overview

This repository contains samples organized by technology and use case:

| Category | Description | Path |
|----------|-------------|------|
| **V2 Samples** | SAP Fiori elements with OData V2 | [V2/](V2/) |
| **V4 Samples** | SAP Fiori elements with OData V4 | [V4/](V4/) |
| **CAP Integration** | Cloud Application Programming Model samples | [cap/](cap/) |
| **Tutorial Samples** | Samples from SAP Developer tutorials | [app-with-tutorials/](app-with-tutorials/) |
| **Third-party Libraries** | Adding external libraries to Fiori apps | [thirdpartylibrary/](thirdpartylibrary/) |
| **Generator Extensions** | Extending @sap/generator-fiori | [sample-fiori-gen-ext/](sample-fiori-gen-ext/) |
| **Migration** | Neo to Cloud Foundry migration | [neo-migration/](neo-migration/) |
| **Utilities** | Proxy, destinations, npm management, CI/CD configurations | [misc/](misc/) |

📑 **[View complete sample catalog](SAMPLES_INDEX.md)** for detailed descriptions and direct links.

## Quick Start

### First-Time Users
Start with the [tutorial-based samples](app-with-tutorials/) that provide step-by-step guidance.

### Experienced Developers
Explore [V4 samples](V4/) for the latest OData V4 and Fiori elements features.

### Advanced Use Cases
Check [misc/](misc/) for proxy configuration, destinations, CI/CD, npm dependency management, and on-premise connectivity.

## Requirements

- Node.js (LTS version recommended)
- npm or yarn
- SAP Business Application Studio or Visual Studio Code with SAP Fiori tools extension

For detailed setup instructions, refer to the [SAP Fiori tools documentation](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/2d8b1cb11f6541e5ab16f05461c64201.html).

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SAP-samples/fiori-tools-samples.git
   cd fiori-tools-samples
   ```

2. **Navigate to a sample**
   ```bash
   cd V2/apps/myfioriapp
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - View application with mock data: Click the displayed `URL`
   - Access mock OData service: Combine `URL` + `Service Path`

   ![example](V2/apps/images/products-review-run.png)

   Example: `http://localhost:8083/sap/opu/odata/sap/SEPMRA_PROD_MAN`

## Contributing

We welcome contributions! Please review our [Contributing Guidelines](.github/CONTRIBUTING.md) before submitting pull requests.

**Quick contribution checklist:**
- Check existing issues and PRs
- Follow the project structure and naming conventions
- Test samples locally before submitting
- Use the provided [issue templates](.github/ISSUE_TEMPLATE/) and [PR template](.github/PULL_REQUEST_TEMPLATE.md)

Read our [Code of Conduct](.github/CODE_OF_CONDUCT.md) for community standards.

## Support

### Report Issues
- **Sample-specific issues**: [Create an issue](https://github.com/SAP-samples/fiori-tools-samples/issues/new/choose) using our templates
- **Tutorial issues**: Report [here](https://github.com/SAPDocuments/Tutorials/issues/new)

### Ask Questions
- **General questions**: [SAP Community](https://community.sap.com/) with tag "SAP Fiori tools"
- **Sample questions**: Use our [question template](https://github.com/SAP-samples/fiori-tools-samples/issues/new?template=question.yml)

### Security Issues
Please refer to [SECURITY.md](.github/SECURITY.md) for reporting security vulnerabilities.

## Additional Resources

- [SAP Fiori Tools Documentation](https://help.sap.com/docs/SAP_FIORI_tools)
- [SAP Fiori Tools Community](https://pages.community.sap.com/topics/fiori-tools)
- [SAP Developer Center](https://developers.sap.com/)
- [SAP UI5 SDK](https://sapui5.hana.ondemand.com/)

## Recent Updates

- ✅ Added comprehensive npm dependency management and audit guide
- ✅ Fixed markdown formatting issues across all README files
- ✅ Added governance files (Contributing, Code of Conduct, Security Policy)
- ✅ Added issue and PR templates for better collaboration
- ✅ Implemented automated link validation on PRs
- ✅ Added branch protection to enforce PR workflow
- ✅ Consolidated LICENSE files with relative references
- ✅ Added CodeQL security scanning

## License

Copyright (c) 2009-2026 SAP SE or an SAP affiliate company. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](/LICENSES/Apache-2.0.txt) file.
