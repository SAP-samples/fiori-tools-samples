"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_fiori_1 = require("@sap/generator-fiori");
// Get the Fiori generator "Project Attributes" step main question names
const { projectAttributes: { mainQuestions: questionNames } } = generator_fiori_1.FioriGeneratorPromptNames;
exports.default = {
    "@sap/generator-fiori": {
        [questionNames.name]: {
            validate: (input) => {
                if (input.length < 3) {
                    return "Name length > 3";
                }
                return true;
            },
            default: "superapp1",
        },
        [questionNames.namespace]: {
            validate: (input, previousAnswers) => {
                if (input.indexOf("random") > -1) {
                    return `Input value: ${input} is not allowed`;
                }
                if (previousAnswers.name === input) {
                    return "Namespace should not match name";
                }
                return true;
            },
            default: (previousAnswers) => (previousAnswers.title === "App Title" ? "super.com" : "great.com"), //(String|Number|Boolean|Array|Function)
        },
    },
};
