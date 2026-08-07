const assertBoolean = (value, field) => {
  if (typeof value !== "boolean") {
    throw new TypeError(`${field} must be a boolean.`);
  }
};

const normalizeLimit = (value, field) => {
  if (value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive integer or null.`);
  }

  return value;
};

export class AIProviderCapabilities {
  constructor({
    textInput = false,
    imageInput = false,
    textOutput = false,
    imageOutput = false,
    streaming = false,
    structuredOutput = false,
    tools = false,
    reasoning = false,
    contextLength = null,
    maxOutput = null,
    supportedParameters = [],
  } = {}) {
    const booleanCapabilities = {
      textInput,
      imageInput,
      textOutput,
      imageOutput,
      streaming,
      structuredOutput,
      tools,
      reasoning,
    };

    Object.entries(booleanCapabilities).forEach(([field, value]) =>
      assertBoolean(value, field)
    );

    if (!Array.isArray(supportedParameters)) {
      throw new TypeError("supportedParameters must be an array.");
    }

    if (
      supportedParameters.some(
        (parameter) => typeof parameter !== "string" || !parameter.trim()
      )
    ) {
      throw new TypeError(
        "supportedParameters must contain only non-empty strings."
      );
    }

    Object.assign(this, booleanCapabilities, {
      contextLength: normalizeLimit(contextLength, "contextLength"),
      maxOutput: normalizeLimit(maxOutput, "maxOutput"),
      supportedParameters: Object.freeze([
        ...new Set(supportedParameters.map((parameter) => parameter.trim())),
      ]),
    });

    Object.freeze(this);
  }

  static from(capabilities) {
    return capabilities instanceof AIProviderCapabilities
      ? capabilities
      : new AIProviderCapabilities(capabilities);
  }

  supports(requirements = {}) {
    return Object.entries(requirements).every(([capability, required]) => {
      if (required === false || required === null || required === undefined) {
        return true;
      }

      if (capability === "contextLength" || capability === "maxOutput") {
        return (
          this[capability] !== null && this[capability] >= Number(required)
        );
      }

      if (capability === "supportedParameters") {
        return (
          Array.isArray(required) &&
          required.every((parameter) =>
            this.supportedParameters.includes(parameter)
          )
        );
      }

      return this[capability] === required;
    });
  }
}
