import { PromptRegistry } from "./PromptRegistry";

export const PROMPT_RENDER_SCHEMA_VERSION = 1;

const registryMethods = Object.freeze(["get", "require", "getByAction"]);

const isPromptRegistry = (registry) => {
  return registryMethods.every(
    (method) => typeof registry?.[method] === "function"
  );
};

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" ? JSON.stringify(item) : String(item)
      )
      .map((item) => `- ${item}`)
      .join("\n");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const injectVariables = (content, variables, definitionsById) => {
  return content.replace(/{{\s*([a-zA-Z][\w.-]*)\s*}}/g, (_, variableId) => {
    if (Object.hasOwn(variables, variableId)) {
      return formatValue(variables[variableId]);
    }

    if (!definitionsById.has(variableId)) {
      throw new Error(`No value resolved for prompt variable: ${variableId}`);
    }

    return "";
  });
};

export class PromptRenderer {
  #registry;

  constructor(registry = new PromptRegistry()) {
    if (!isPromptRegistry(registry)) {
      throw new TypeError(
        "PromptRenderer requires a prompt registry contract."
      );
    }

    this.#registry = registry;
  }

  render({
    templateId = null,
    actionId = null,
    versionId = null,
    variables = {},
  }) {
    if (
      !variables ||
      typeof variables !== "object" ||
      Array.isArray(variables)
    ) {
      throw new TypeError("Prompt render variables must be an object.");
    }

    const template = this.#selectTemplate(templateId, actionId);
    const version = template.getVersion(versionId);
    const definitions = version.listVariables();
    const definitionsById = new Map(
      definitions.map((definition) => [definition.id, definition])
    );
    const unknownVariables = Object.keys(variables).filter(
      (variableId) => !definitionsById.has(variableId)
    );

    if (unknownVariables.length > 0) {
      throw new Error(
        `Unknown variables for prompt ${template.id}: ${unknownVariables.join(", ")}`
      );
    }

    const resolvedVariables = {};

    definitions.forEach((definition) => {
      const value = definition.resolve(variables[definition.id]);

      if (value !== undefined) {
        resolvedVariables[definition.id] = value;
      }
    });

    const frozenVariables = Object.freeze({ ...resolvedVariables });
    const systemInstructions = injectVariables(
      version.systemInstructions,
      frozenVariables,
      definitionsById
    );
    const content = injectVariables(
      version.templateContent,
      frozenVariables,
      definitionsById
    );
    const messages = Object.freeze([
      Object.freeze({ role: "system", content: systemInstructions }),
      Object.freeze({ role: "user", content }),
    ]);

    return Object.freeze({
      schemaVersion: PROMPT_RENDER_SCHEMA_VERSION,
      templateId: template.id,
      actionId: template.supportedAction,
      versionId: version.id,
      messages,
      variables: frozenVariables,
      outputSchema: version.outputContract.toReference(),
      capabilityRequirements: template.capabilityRequirements,
    });
  }

  #selectTemplate(templateId, actionId) {
    if (templateId) {
      const template = this.#registry.require(templateId);

      if (actionId && template.supportedAction !== actionId) {
        throw new Error(
          `Prompt template ${templateId} does not support action ${actionId}.`
        );
      }

      return template;
    }

    if (!actionId) {
      throw new Error("Prompt rendering requires a templateId or actionId.");
    }

    const templates = this.#registry.getByAction(actionId);

    if (templates.length === 0) {
      throw new Error(`No prompt template registered for action: ${actionId}`);
    }

    if (templates.length > 1) {
      throw new Error(
        `Multiple prompt templates support ${actionId}; select a templateId.`
      );
    }

    return templates[0];
  }
}
