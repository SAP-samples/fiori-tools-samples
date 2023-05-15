import { FioriGeneratorPromptExtension, FioriGeneratorPromptNames } from "@sap/generator-fiori";
// Get the Fiori generator "Project Attributes" step main question names
const { projectAttributes: { mainQuestions: questionNames } } = FioriGeneratorPromptNames;

export default {
  "@sap/generator-fiori": {
    [questionNames.name]: {
      validate: (input: string): boolean | string => {
        if (input.length < 3) {
          return "Name length > 3";
        }
        return true;
      },
      default: "superapp1",
    },
    [questionNames.namespace]: {
      validate: (input: string, previousAnswers?): boolean | string => {
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
  } as FioriGeneratorPromptExtension,
};
