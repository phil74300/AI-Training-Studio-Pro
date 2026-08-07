export const PromptVariableType = Object.freeze({
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  BOOLEAN: "boolean",
  ARRAY: "array",
  OBJECT: "object",
});

const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
      )
    );
  }

  return value;
};

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const normalizeRules = (rules) => {
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
    throw new TypeError("Prompt variable validationRules must be an object.");
  }

  const normalized = { ...rules };

  if (normalized.allowedValues !== undefined) {
    if (!Array.isArray(normalized.allowedValues)) {
      throw new TypeError("validationRules.allowedValues must be an array.");
    }

    normalized.allowedValues = cloneValue(normalized.allowedValues);
  }

  if (normalized.pattern !== undefined) {
    requireText(normalized.pattern, "validationRules.pattern");
    new RegExp(normalized.pattern);
  }

  ["minLength", "maxLength"].forEach((field) => {
    if (
      normalized[field] !== undefined &&
      (!Number.isInteger(normalized[field]) || normalized[field] < 0)
    ) {
      throw new TypeError(
        `validationRules.${field} must be a positive integer.`
      );
    }
  });

  ["min", "max"].forEach((field) => {
    if (
      normalized[field] !== undefined &&
      !Number.isFinite(normalized[field])
    ) {
      throw new TypeError(`validationRules.${field} must be a finite number.`);
    }
  });

  return Object.freeze(normalized);
};

export class PromptVariable {
  #hasDefault;

  constructor(definition) {
    if (!definition || typeof definition !== "object") {
      throw new TypeError("PromptVariable requires a definition.");
    }

    const {
      id,
      type,
      required = false,
      description,
      validationRules = {},
    } = definition;

    if (!Object.values(PromptVariableType).includes(type)) {
      throw new TypeError(`Unsupported prompt variable type: ${type}`);
    }

    if (typeof required !== "boolean") {
      throw new TypeError("Prompt variable required must be a boolean.");
    }

    this.id = requireText(id, "Prompt variable id");
    this.type = type;
    this.required = required;
    this.description = requireText(description, "Prompt variable description");
    this.validationRules = normalizeRules(validationRules);
    this.#hasDefault = Object.hasOwn(definition, "defaultValue");
    this.defaultValue = this.#hasDefault
      ? cloneValue(definition.defaultValue)
      : undefined;

    if (this.#hasDefault) {
      this.#validateValue(this.defaultValue);
    }

    Object.freeze(this);
  }

  resolve(value) {
    const resolvedValue =
      value === undefined && this.#hasDefault ? this.defaultValue : value;

    if (resolvedValue === undefined) {
      if (this.required) {
        throw new Error(`Missing required prompt variable: ${this.id}`);
      }

      return undefined;
    }

    this.#validateValue(resolvedValue);

    return cloneValue(resolvedValue);
  }

  #validateValue(value) {
    const typeMatches = {
      [PromptVariableType.STRING]: typeof value === "string",
      [PromptVariableType.NUMBER]:
        typeof value === "number" && Number.isFinite(value),
      [PromptVariableType.INTEGER]: Number.isInteger(value),
      [PromptVariableType.BOOLEAN]: typeof value === "boolean",
      [PromptVariableType.ARRAY]: Array.isArray(value),
      [PromptVariableType.OBJECT]:
        Boolean(value) && typeof value === "object" && !Array.isArray(value),
    };

    if (!typeMatches[this.type]) {
      throw new TypeError(
        `Prompt variable ${this.id} must be of type ${this.type}.`
      );
    }

    const rules = this.validationRules;
    const length = value?.length;

    if (rules.minLength !== undefined && length < rules.minLength) {
      throw new Error(
        `Prompt variable ${this.id} must contain at least ${rules.minLength} items or characters.`
      );
    }

    if (rules.maxLength !== undefined && length > rules.maxLength) {
      throw new Error(
        `Prompt variable ${this.id} must contain at most ${rules.maxLength} items or characters.`
      );
    }

    if (rules.min !== undefined && value < rules.min) {
      throw new Error(
        `Prompt variable ${this.id} must be at least ${rules.min}.`
      );
    }

    if (rules.max !== undefined && value > rules.max) {
      throw new Error(
        `Prompt variable ${this.id} must be at most ${rules.max}.`
      );
    }

    if (
      rules.allowedValues &&
      !rules.allowedValues.some((allowedValue) => allowedValue === value)
    ) {
      throw new Error(`Prompt variable ${this.id} has an unsupported value.`);
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      throw new Error(`Prompt variable ${this.id} has an invalid format.`);
    }
  }
}
