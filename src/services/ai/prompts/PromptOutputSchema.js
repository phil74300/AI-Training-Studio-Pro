export const PromptResultType = Object.freeze({
  TEXT: "text",
  LESSON: "lesson",
  QUIZ: "quiz",
  IMAGE: "image",
  ARTIFACT: "artifact",
  EDITOR_SUGGESTION: "editor-suggestion",
});

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

export class PromptOutputSchema {
  constructor({ id, version, expectedResultType, definition = {} }) {
    if (!Object.values(PromptResultType).includes(expectedResultType)) {
      throw new TypeError(
        `Unsupported prompt result type: ${expectedResultType}`
      );
    }

    if (
      !definition ||
      typeof definition !== "object" ||
      Array.isArray(definition)
    ) {
      throw new TypeError("Prompt output schema definition must be an object.");
    }

    this.id = requireText(id, "Prompt output schema id");
    this.version = requireText(version, "Prompt output schema version");
    this.expectedResultType = expectedResultType;
    this.definition = cloneAndFreeze(definition);

    Object.freeze(this);
  }

  toReference() {
    return Object.freeze({
      id: this.id,
      version: this.version,
      expectedResultType: this.expectedResultType,
    });
  }
}
