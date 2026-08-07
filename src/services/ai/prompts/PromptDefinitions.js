import { AIAction } from "../AIAction";
import { PromptOutputSchema, PromptResultType } from "./PromptOutputSchema";
import { PromptRegistry } from "./PromptRegistry";
import { PromptTemplate } from "./PromptTemplate";
import { PromptVariable, PromptVariableType } from "./PromptVariable";
import { PromptVersion } from "./PromptVersion";

const CREATION_METADATA = Object.freeze({
  createdAt: "2026-08-07",
  author: "AI Training Studio Pro",
  notes: "Initial non-production prompt definition.",
});

const requiredText = (id, description) =>
  new PromptVariable({
    id,
    type: PromptVariableType.STRING,
    required: true,
    description,
    validationRules: { minLength: 1 },
  });

const optionalText = (id, description, defaultValue) =>
  new PromptVariable({
    id,
    type: PromptVariableType.STRING,
    required: false,
    description,
    validationRules: { minLength: 1 },
    defaultValue,
  });

const objectivesVariable = () =>
  new PromptVariable({
    id: "objectives",
    type: PromptVariableType.ARRAY,
    required: true,
    description: "Observable learning objectives served by the content.",
    validationRules: { minLength: 1 },
  });

const audienceLevelVariable = () =>
  new PromptVariable({
    id: "audienceLevel",
    type: PromptVariableType.STRING,
    required: true,
    description: "Learner experience level.",
    validationRules: {
      allowedValues: ["beginner", "intermediate", "expert"],
    },
  });

const difficultyVariable = () =>
  new PromptVariable({
    id: "difficulty",
    type: PromptVariableType.STRING,
    required: true,
    description: "Expected assessment difficulty.",
    validationRules: {
      allowedValues: ["beginner", "intermediate", "expert"],
    },
  });

export const promptOutputSchemas = Object.freeze({
  text: new PromptOutputSchema({
    id: "text-output",
    version: "1.0",
    expectedResultType: PromptResultType.TEXT,
  }),
  lesson: new PromptOutputSchema({
    id: "lesson-output",
    version: "1.0",
    expectedResultType: PromptResultType.LESSON,
    definition: {
      requiredSections: [
        "title",
        "objectives",
        "introduction",
        "theory",
        "examples",
        "exercises",
        "evaluation",
        "summary",
      ],
    },
  }),
  quiz: new PromptOutputSchema({
    id: "quiz-output",
    version: "1.0",
    expectedResultType: PromptResultType.QUIZ,
    definition: {
      supportedQuestionTypes: [
        "multiple-choice",
        "true-false",
        "scenario",
        "open-question",
      ],
    },
  }),
  editorSuggestion: new PromptOutputSchema({
    id: "editor-suggestion-output",
    version: "1.0",
    expectedResultType: PromptResultType.EDITOR_SUGGESTION,
  }),
});

const createTemplate = ({
  id,
  name,
  description,
  supportedAction,
  variables,
  outputSchema,
  systemInstructions,
  templateContent,
  capabilityRequirements,
}) => {
  const version = new PromptVersion({
    id: "1.0",
    creationMetadata: CREATION_METADATA,
    systemInstructions,
    templateContent,
    variables,
    outputContract: outputSchema,
  });

  return new PromptTemplate({
    id,
    name,
    description,
    supportedAction,
    versions: [version],
    requiredVariables: variables
      .filter((variable) => variable.required)
      .map((variable) => variable.id),
    outputSchemaReference: outputSchema.toReference(),
    capabilityRequirements,
  });
};

const textCapabilities = Object.freeze({
  textInput: true,
  textOutput: true,
});

const structuredTextCapabilities = Object.freeze({
  textInput: true,
  textOutput: true,
  structuredOutput: true,
});

export const promptTemplates = Object.freeze([
  createTemplate({
    id: "generate-lesson",
    name: "Generate lesson",
    description: "Structures a pedagogically aligned lesson proposal.",
    supportedAction: AIAction.GENERATE_LESSON,
    variables: [
      requiredText("subject", "Subject of the lesson."),
      requiredText("audience", "Target professional audience."),
      audienceLevelVariable(),
      requiredText("language", "Language used for the lesson."),
      requiredText("duration", "Expected learning duration."),
      requiredText("trainingContext", "Professional training context."),
      objectivesVariable(),
      requiredText("evaluationMethod", "Method used to evaluate learning."),
    ],
    outputSchema: promptOutputSchemas.lesson,
    systemInstructions:
      "Act as a pedagogical assistant. Propose content for trainer review and never present it as automatically approved.",
    templateContent:
      "Create a lesson proposal about {{subject}} for {{audience}} at {{audienceLevel}} level, in {{language}}, with a duration of {{duration}}. Training context: {{trainingContext}}. Learning objectives: {{objectives}}. Evaluation method: {{evaluationMethod}}. Align the lesson structure, practice, and evaluation with these objectives.",
    capabilityRequirements: structuredTextCapabilities,
  }),
  createTemplate({
    id: "improve-content",
    name: "Improve content",
    description: "Proposes pedagogical improvements to existing content.",
    supportedAction: AIAction.IMPROVE_TEXT,
    variables: [
      requiredText("content", "Existing trainer-provided content."),
      requiredText("audience", "Target professional audience."),
      audienceLevelVariable(),
      requiredText("language", "Language used for the improved content."),
      objectivesVariable(),
      optionalText(
        "trainingContext",
        "Professional setting in which learning is applied.",
        "general professional training"
      ),
    ],
    outputSchema: promptOutputSchemas.editorSuggestion,
    systemInstructions:
      "Act as a pedagogical assistant. Preserve trainer intent and return suggestions that require explicit approval.",
    templateContent:
      "Improve the following content for {{audience}} at {{audienceLevel}} level in {{language}}. Training context: {{trainingContext}}. Objectives: {{objectives}}. Explain material improvements and preserve factual meaning. Content: {{content}}",
    capabilityRequirements: textCapabilities,
  }),
  createTemplate({
    id: "summarize-content",
    name: "Summarize content",
    description: "Creates an objective-focused learning summary.",
    supportedAction: AIAction.SUMMARIZE,
    variables: [
      requiredText("content", "Content to summarize."),
      audienceLevelVariable(),
      requiredText("language", "Language used for the summary."),
      objectivesVariable(),
    ],
    outputSchema: promptOutputSchemas.text,
    systemInstructions:
      "Act as a pedagogical assistant. Summaries must preserve essential meaning, safety information, and learning intent.",
    templateContent:
      "Summarize this content in {{language}} for {{audienceLevel}} learners. Preserve information required by these objectives: {{objectives}}. Content: {{content}}",
    capabilityRequirements: textCapabilities,
  }),
  createTemplate({
    id: "generate-quiz",
    name: "Generate quiz",
    description: "Structures an objective-aligned assessment proposal.",
    supportedAction: AIAction.GENERATE_QUIZ,
    variables: [
      requiredText("subject", "Subject assessed by the quiz."),
      audienceLevelVariable(),
      difficultyVariable(),
      requiredText("language", "Language used for the assessment."),
      objectivesVariable(),
      requiredText("trainingContext", "Professional training context."),
      requiredText("evaluationMethod", "Intended evaluation method."),
    ],
    outputSchema: promptOutputSchemas.quiz,
    systemInstructions:
      "Act as a pedagogical assessment assistant. Avoid ambiguous questions and explain expected answers for trainer review.",
    templateContent:
      "Create a quiz proposal about {{subject}} in {{language}} for {{audienceLevel}} learners at {{difficulty}} difficulty. Training context: {{trainingContext}}. Objectives: {{objectives}}. Evaluation method: {{evaluationMethod}}. Align every question with an objective and include answer explanations.",
    capabilityRequirements: structuredTextCapabilities,
  }),
  createTemplate({
    id: "translate-content",
    name: "Translate content",
    description: "Adapts training content to a target language.",
    supportedAction: AIAction.TRANSLATE,
    variables: [
      requiredText("content", "Content to translate."),
      requiredText("language", "Target language."),
      optionalText("sourceLanguage", "Known source language.", "automatic"),
      requiredText("trainingContext", "Professional training context."),
      objectivesVariable(),
    ],
    outputSchema: promptOutputSchemas.text,
    systemInstructions:
      "Act as a pedagogical localization assistant. Preserve learning objectives, technical meaning, and explicit uncertainty.",
    templateContent:
      "Translate content from {{sourceLanguage}} into {{language}} for this training context: {{trainingContext}}. Preserve these objectives: {{objectives}}. Do not silently change technical or safety meaning. Content: {{content}}",
    capabilityRequirements: textCapabilities,
  }),
  createTemplate({
    id: "explain-concept",
    name: "Explain concept",
    description: "Explains a concept at an appropriate learner level.",
    supportedAction: AIAction.EXPLAIN,
    variables: [
      requiredText("subject", "Concept to explain."),
      requiredText("audience", "Target professional audience."),
      audienceLevelVariable(),
      requiredText("language", "Language used for the explanation."),
      requiredText("duration", "Time available for the explanation."),
      requiredText("trainingContext", "Professional training context."),
      objectivesVariable(),
    ],
    outputSchema: promptOutputSchemas.text,
    systemInstructions:
      "Act as a pedagogical assistant. Explain clearly, state assumptions, and prioritize professional accuracy over creativity.",
    templateContent:
      "Explain {{subject}} in {{language}} to {{audience}} at {{audienceLevel}} level. Fit the explanation within {{duration}} for this context: {{trainingContext}}. Serve these objectives: {{objectives}}. Include a practical example and identify assumptions requiring trainer review.",
    capabilityRequirements: textCapabilities,
  }),
]);

export function createDefaultPromptRegistry() {
  return new PromptRegistry(promptTemplates);
}
