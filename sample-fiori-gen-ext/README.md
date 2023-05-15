# Sample Fiori generator extension sub-generator

This module is an example of how to extend `@sap/generator-fiori`, adding additional steps, prompts and customizing existing prompt validators and default values.

## Building and installing the sample Fiori generator extension

1. Clone this repo locally.
2. Run `yarn install` in the `sample-fiori-gen-ext` directory ( pre-requisite: `yarn` is installed globally )
3. Build the extension sample using `yarn build`
3. Create the installable artefact by running `yarn pack`
4. Install the tgz globally using `npm i -g sample-fiori-gen-ext-v0.1.0.tgz`

To see the sample extension in action run the Fiori generator using the Application Wizard vscode extension as usual in Business Application Studio or directly in VSCode. A CLI version is also supported. Once the sample extension has been installed globally the additional steps should be visible on the navigation panel in the Application Wizard when using the `SAP Fiori application` generator ( package: `@sap/generator-fiori` version: `1.9.7` and above).

## How to provide an extension generator

Extension generators are loaded during Fiori generator initialization. These should be installed as node modules into one of the following locations:

1. The global npm module location (Run `npm -g root` to view the location. Install using `npm install -g <extension-module-tgz>`)
2. Any of the standard install locations in a BAS dev space (see ref for configuration of BAS to pre-install)
3. The custom location defined by the VSCode setting: `Application Wizard: Installation Location`

There are a few important settings required for the extension to be found.

1. The package name, and therefore installed module folder name, must include the string `fiori-gen-ext`. 
2. The package.json file must include the keyword: `"fiori-generator-extension"`. Note that the keyword: `yeoman-generator` should also be included to indicate to Yeoman that this is a generator.

e.g. package.json: 
```
{
    name: "@acme/acme_fiori_gen_ext",
    keywords: [
        "yeoman-generator",
        "fiori-generator-extension"
    ]
}
```

A sample extension generator can be found here: https://github.com/SAP-samples/fiori-tools-samples/sample-fiori-gen-ext



## Structure of a Fiori generator extension generator

Extension generators are essentially generators which utilize the `composeWith` functiionality provided by Yeoman (https://yeoman.io/authoring/composability.html) that additionally implement the `FioriGeneratorExtensionAPI` interface:

```
export interface FioriGeneratorExtensionAPI {
    /**
     * Returns the settings to control some prompt and generation options
     */
    _getSettings?: () => FioriGeneratorSettings;
    /**
     * Returns the extensions which extend existing Fiori generator prompts
     */
    _getExtensions?: () => FioriGeneratorPromptExtension;
    /**
     * Returns the navigation steps which group new prompts provided by the `prompting` phase
     */
    _getSteps?: () => Step[];
}
```

All required type definitions can be imported from the module `@sap/generator-fiori`.

## Customizing existing prompts

Existing Fiori generator prompts can be extended by providing an implemetation of the `_getExtensions` function interface from a generator. 

Prompts (questions) defintions are based on the Inquirer-js json structure as defined here: https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer#questions.
Currently a limited set of prompts can be customized by providing properties for `default` and/or `validate`. These prompts appear on the Project Attributes step and are identifed by name:

- name : module name
- title : application title
- namespace : applicaiton namespace
- description : application description
- targetFolder : the absolute path where the application will be generated
- ui5Version : the minimum ui5 version defined in the application manifest.json

The complete set of extendable prompts is defined by the definition `FioriGeneratorPromptNames` exported by the node module `https://www.npmjs.com/package/@sap/generator-fiori`. 

An example of providing `_getExtensions` might be: 

```
...
import { FioriGeneratorExtensionAPI, FioriGeneratorPromptNames } from "@sap/generator-fiori";

...
class extends Generator implements FioriGeneratorExtensionAPI
...
// Get the Fiori generator "Project Attributes" step main question names
const { projectAttributes: { mainQuestions: questionNames } } = FioriGeneratorPromptNames;
...
...
    // Provide the extension prompts
    _getExtensions(): FioriGeneratorPromptExtension {
        this.log(`Getting extension defintions`);
        const extensions = {
            "@sap/generator-fiori": {
                [questionNames.name]: {
                    validate: (input: string): boolean | string => {
                        if (input.length < 3) {
                           return "Name length > 3";
                        }
                        return true;
                    },
                    default: "superapp1",
                }
            }
        }
        return extensions;
    }
...
```

In the above example the generated app name prompt input will additionally validate that the input string has length greater than 3. If the input string value length is less than 3 a validation message will be shown to the user and progress through the generator prompts will be blocked. In addition any other validation that is assigned to the the prompt will also be executed and so all validations both custom and internally defined will need to return true before the input is considered valid.

The default value in the above example will be set to "superapp1".

~~exanmple-validator-ext.png (insert image)~~


Note that default values are only dynamically applied where prompts have been defined with the gui option `applyDefaultWhenDirty` or an answer has not been provided by the user. The setting `applyDefaultWhenDirty` is not assignable by a customized prompt extension and the behaviour should be tested to determine if it is applied when other prompt answers are updated.

Add more entries, one per question name, to the returned extension object as required.

## Adding new stesps to the Fiori generator UI

To add new questions to the Fiori generator the name and description of the left-hand-side navigation items must be provided along with the question descriptions and a little code to run and process the questions. A full example of adding 2 new steps and running the questions can be found here: https://github.com/SAP-samples/fiori-tools-samples/sample-fiori-gen-ext

```
...
import { FioriGeneratorExtensionAPI } from "@sap/generator-fiori";
import { IPrompt as YUIStep } from "@sap-devx/yeoman-ui-types";
...
class extends Generator implements FioriGeneratorExtensionAPI {
...
    async prompting(): Promise<void> {
        this.log('Sample Fiori generator extension: prompting()');
        // These are the prompts for the first step
        const answersPrompt1 = await this.prompt([
            {
                type: "input",
                guiOptions: {
                breadcrumb: true,
                },
                name: "prompt1",
                message: "Sample prompt1",
                default: 'Default value prompt1',
                validate: (val, answers): boolean | string =>
                    val ? true : "Validation message from prompt1, enter a value"
            },
            {
                type: "input",
                guiOptions: {
                breadcrumb: true,
                },
                name: "prompt2",
                message: "Sample prompt2",
                validate: (val, answers): boolean | string =>
                val ? true : "Validation message from prompt2, enter a value"
            }
        ]);
        this.log(`Answers from sample sub-generator "Extension step 1" prompts:  ${JSON.stringify(answersPrompt1)}`);
        // These are the prompts for the second step
        const answersPrompt2 = await this.prompt([
            {
                type: "input",
                guiOptions: {
                breadcrumb: true,
                },
                name: "prompt3",
                message: "Sample prompt3",
                default: () => this.fioriGeneratorState.project.namespace || ""
            },
            {
                type: "input",
                guiOptions: {
                breadcrumb: true,
                },
                name: "prompt4",
                message: "Sample prompt4"
            }
        ]);
        this.log(`Answers from sample sub-generator "Extension step 2" prompts:  ${JSON.stringify(answersPrompt2)}`);
        // Assign local answers for access in following phases
        this.localAnswers = Object.assign({}, answersPrompt1, answersPrompt2);
    }
    // Return the nav steps that will be added to the LHS navigation panel
    // Note: for each step there must be one call to prompt()
    _getSteps(): YUIStep[] {
        return [
            {
                name: "Extension step 1",
                description: "Extension step 1 description",
            },
            {
                name: "Extension step 2",
                description: "Extension step 2 description",
            }
        ];
    }
...
}
```
The above implementation will result in the UI:
~~insert image: adding-questions-steps.jpeg~~

Adding steps conditionally, perhaps based on the value of a previous answer, can be achieved using the slightly more complex approach as described here: https://github.com/SAP/yeoman-ui/tree/master/packages/generator-foodq.

## Updating or writing files in the Fiori generator extension

Internally Fiori generator uses the Yeoman `composeWith` functionality to add the generator extension. This means that each lifecycle phase of the extended generator will be run in the order defined by the run loop ordering: https://yeoman.io/authoring/running-context.html. The Fiori generator ensures that any extensions are always added after the prompting phase to ensure that it will receive the values of previous answers and also that it is added to the end of the run loop thus ensuring that when the `writing` phase is executed the generated files already exist in memory. This is convienent when extensions need to extend, update or write new files. 

The in-memory file system can be accessed via the `this.fs` reference. An example of implementing the `writing` phase in a Fiori generator extenion might be:

```
...
    async writing(): Promise<void> {
        const manifestPath = this.destinationPath('webapp', 'manifest.json');
        // Write a new file with some prompt answers
        this.fs.writeJSON(this.destinationPath('sample.json'), {
        moduleName: this.fioriGeneratorState.project.name,
        moduleNamespace: this.fioriGeneratorState.project.namespace,
        ...this.localAnswers
        });

        // Extend the application manifest.json
        this.fs.extendJSON(manifestPath, {
        'sap.app': {
            tags: {
                keywords: ["fiori", "custom extension", "acme"]
            }
        }});

        // Update the package.json, for example, by adding a dependency
        const packageJsonPath = this.destinationPath('package.json');
        if (this.fs.exists(packageJsonPath)) {
        this.fs.extendJSON(packageJsonPath, { devDependencies: { 'fast-glob': '3.2.12' }})
        };
    }
...
```

Please see the sample extension package:  https://github.com/SAP-samples/fiori-tools-samples/sample-fiori-gen-ext for a full working sample.

For additional help pleae reach out using our Community Forum: https://answers.sap.com/tags/73555000100800002345


