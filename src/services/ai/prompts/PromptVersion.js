import { PromptOutputSchema } from "./PromptOutputSchema";
import { PromptVariable } from "./PromptVariable";

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const normalizeCreationMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new TypeError("Prompt version creationMetadata must be an object.");
  }

  const createdAt = requireText(
    metadata.createdAt,
    "creationMetadata.createdAt"
  );

  if (Number.isNaN(Date.parse(createdAt))) {
    throw new TypeError("creationMetadata.createdAt must be a valid date.");
  }

  return Object.freeze({
    createdAt,
    author: requireText(metadata.author, "creationMetadata.author"),
    notes:
      metadata.notes === undefined
        ? ""
        : requireText(metadata.notes, "creationMetadata.notes"),
  });
};

export class PromptVersion {
  #variables;

  #variablesById;

  constructor({
    id,
    creationMetadata,
    systemInstructions,
    templateContent,
    variables = [],
    outputContract,
  }) {
    if (!Array.isArray(variables)) {
      throw new TypeError("Prompt version variables must be an array.");
    }

    if (!(outputContract instanceof PromptOutputSchema)) {
      throw new TypeError(
        "Prompt version outputContract must be a PromptOutputSchema."
      );
    }

    const normalizedVariables = variables.map((variable) =>
      variable instanceof PromptVariable
        ? variable
        : new PromptVariable(variable)
    );
    const variablesById = new Map();

    normalizedVariables.forEach((variable) => {
      if (variablesById.has(variable.id)) {
        throw new Error(`Duplicate prompt variable: ${variable.id}`);
      }

      variablesById.set(variable.id, variable);
    });

    this.id = requireText(id, "Prompt version id");
    this.creationMetadata = normalizeCreationMetadata(creationMetadata);
    this.systemInstructions = requireText(
      systemInstructions,
      "Prompt version systemInstructions"
    );
    this.templateContent = requireText(
      templateContent,
      "Prompt version templateContent"
    );
    this.outputContract = outputContract;
    this.#variables = Object.freeze(normalizedVariables);
    this.#variablesById = variablesById;

    Object.freeze(this);
  }

  getVariable(variableId) {
    return this.#variablesById.get(variableId) || null;
  }

  listVariables() {
    return this.#variables;
  }
}
