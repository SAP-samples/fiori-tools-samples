import { FioriGeneratorPromptExtension } from "@sap/generator-fiori";
import { promptNames } from "@sap-ux/ui5-application-inquirer/dist/types";

export default {
    "@sap/generator-fiori": {
        [promptNames.name]: {
            validate: (input: string): boolean | string => {
                if (input.length < 3) {
                    return "Name length > 3";
                }
                return true;
            },
            default: "superapp1",
        },
        [promptNames.namespace]: {
            validate: (input: string, previousAnswers?): boolean | string => {
                if (input.indexOf("random") > -1) {
                    return `Input value: ${input} is not allowed`;
                }
                if (previousAnswers.name === input) {
                    return "Namespace should not match name";
                }
                return true;
            },
            default: (previousAnswers) =>
                previousAnswers.title === "App Title"
                    ? "super.com"
                    : "great.com",
        },
    } as FioriGeneratorPromptExtension,
};
