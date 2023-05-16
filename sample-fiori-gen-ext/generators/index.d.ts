import Generator from "yeoman-generator";
import { FioriGeneratorExtensionAPI, FioriGeneratorSettings, ReadonlyState, FioriGeneratorPromptExtension } from "@sap/generator-fiori";
import { IPrompt as YUIStep } from "@sap-devx/yeoman-ui-types";
export default class extends Generator implements FioriGeneratorExtensionAPI {
    fioriGeneratorState: ReadonlyState;
    localAnswers: any;
    constructor(args: any, opts: Generator.GeneratorOptions);
    prompting(): Promise<void>;
    configuring(): Promise<void>;
    writing(): Promise<void>;
    _getExtensions(): FioriGeneratorPromptExtension;
    _getSteps(): YUIStep[];
    /**
     * Provide the settings options to the consuming generator
     */
    _getSettings(): FioriGeneratorSettings;
}
//# sourceMappingURL=index.d.ts.map