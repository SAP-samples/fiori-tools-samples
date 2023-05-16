"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
const questions_1 = __importDefault(require("./custom/questions"));
const path_1 = require("path");
class default_1 extends yeoman_generator_1.default {
    fioriGeneratorState;
    localAnswers;
    constructor(args, opts) {
        super(args, opts);
        this.fioriGeneratorState = this.options.state;
    }
    async prompting() {
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
                validate: (val, answers) => val ? true : "Validation message from prompt1, enter a value",
            },
            {
                type: "input",
                guiOptions: {
                    breadcrumb: true,
                },
                name: "prompt2",
                message: "Sample prompt2",
                validate: (val, answers) => val ? true : "Validation message from prompt2, enter a value",
            },
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
            },
        ]);
        this.log(`Answers from sample sub-generator "Extension step 2" prompts:  ${JSON.stringify(answersPrompt2)}`);
        // Assign local answers for access in following phases
        this.localAnswers = Object.assign({}, answersPrompt1, answersPrompt2);
    }
    async configuring() {
        // Set the root path so it can be excluded in calls to `this.fs`
        this.destinationRoot((0, path_1.join)(this.fioriGeneratorState.project.targetFolder, this.fioriGeneratorState.project.name));
    }
    async writing() {
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
            }
        });
        // Update the package.json, for example, by adding a dependency
        const packageJsonPath = this.destinationPath('package.json');
        if (this.fs.exists(packageJsonPath)) {
            this.fs.extendJSON(packageJsonPath, { devDependencies: { 'fast-glob': '3.2.12' } });
        }
        ;
    }
    // Provide the extension prompts
    _getExtensions() {
        this.log(`Getting extension defintions`);
        return questions_1.default;
    }
    // Return the nav steps that will be added to the LHS navigation panel
    // Note: for each step there must be one call to prompt()
    _getSteps() {
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
    /**
     * Provide the settings options to the consuming generator
     */
    _getSettings() {
        return {
            generateIndexHtml: false
        };
    }
}
exports.default = default_1;
