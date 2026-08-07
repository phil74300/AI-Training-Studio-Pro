import { PromptVersion } from "./PromptVersion";

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const cloneAndFreeze = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneAndFreeze(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneAndFreeze(item)])
      )
    );
  }

  return value;
};

const normalizeOutputSchemaReference = (reference) => {
  if (!reference || typeof reference !== "object") {
    throw new TypeError("Prompt template outputSchemaReference is required.");
  }

  return Object.freeze({
    id: requireText(reference.id, "outputSchemaReference.id"),
    version: requireText(reference.version, "outputSchemaReference.version"),
    expectedResultType: requireText(
      reference.expectedResultType,
      "outputSchemaReference.expectedResultType"
    ),
  });
};

export class PromptTemplate {
  #versions;

  #versionsById;

  constructor({
    id,
    name,
    description,
    supportedAction,
    versions,
    requiredVariables = [],
    outputSchemaReference,
    capabilityRequirements = {},
  }) {
    if (!Array.isArray(versions) || versions.length === 0) {
      throw new TypeError("Prompt template requires at least one version.");
    }

    if (!Array.isArray(requiredVariables)) {
      throw new TypeError(
        "Prompt template requiredVariables must be an array."
      );
    }

    if (
      !capabilityRequirements ||
      typeof capabilityRequirements !== "object" ||
      Array.isArray(capabilityRequirements)
    ) {
      throw new TypeError("capabilityRequirements must be an object.");
    }

    const normalizedVersions = versions.map((version) =>
      version instanceof PromptVersion ? version : new PromptVersion(version)
    );
    const versionsById = new Map();
    const normalizedRequiredVariables = Object.freeze([
      ...new Set(
        requiredVariables.map((variableId) =>
          requireText(variableId, "requiredVariables item")
        )
      ),
    ]);
    const normalizedOutputReference = normalizeOutputSchemaReference(
      outputSchemaReference
    );

    normalizedVersions.forEach((version) => {
      if (versionsById.has(version.id)) {
        throw new Error(`Duplicate prompt version: ${version.id}`);
      }

      normalizedRequiredVariables.forEach((variableId) => {
        const variable = version.getVariable(variableId);

        if (!variable?.required) {
          throw new Error(
            `Prompt version ${version.id} must define required variable ${variableId}.`
          );
        }
      });

      const versionOutput = version.outputContract.toReference();

      if (
        versionOutput.id !== normalizedOutputReference.id ||
        versionOutput.version !== normalizedOutputReference.version ||
        versionOutput.expectedResultType !==
          normalizedOutputReference.expectedResultType
      ) {
        throw new Error(
          `Prompt version ${version.id} does not match the template output schema.`
        );
      }

      versionsById.set(version.id, version);
    });

    this.id = requireText(id, "Prompt template id");
    this.name = requireText(name, "Prompt template name");
    this.description = requireText(description, "Prompt template description");
    this.supportedAction = requireText(
      supportedAction,
      "Prompt template supportedAction"
    );
    this.requiredVariables = normalizedRequiredVariables;
    this.outputSchemaReference = normalizedOutputReference;
    this.capabilityRequirements = cloneAndFreeze(capabilityRequirements);
    this.#versions = Object.freeze(
      [...normalizedVersions].sort((left, right) =>
        left.id.localeCompare(right.id, undefined, { numeric: true })
      )
    );
    this.#versionsById = versionsById;

    Object.freeze(this);
  }

  getVersion(versionId = null) {
    if (versionId === null) {
      return this.#versions.at(-1);
    }

    const version = this.#versionsById.get(versionId);

    if (!version) {
      throw new Error(`Unknown prompt version ${versionId} for ${this.id}.`);
    }

    return version;
  }

  listVersions() {
    return this.#versions;
  }
}
