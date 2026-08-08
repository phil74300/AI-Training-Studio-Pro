import {
  GEMINI_CONFIGURATION_FIELDS,
  GeminiConfiguration,
} from "./GeminiConfiguration";
import { findGeminiModel } from "../GeminiModelCatalog";
import { GEMINI_PROVIDER_ID } from "../GeminiModelDescriptor";

const credentialFieldNames = Object.freeze(
  new Set([
    "apikey",
    "apikeyvalue",
    "key",
    "token",
    "accesstoken",
    "secret",
    "secretvalue",
    "credential",
    "credentials",
  ])
);

const isRecord = (value) =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const normalizeFieldName = (field) => field.replace(/[-_]/g, "").toLowerCase();

const findEmbeddedCredentialPaths = (value, path = "configuration") => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findEmbeddedCredentialPaths(item, `${path}[${index}]`)
    );
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([field, item]) => {
    const fieldPath = `${path}.${field}`;

    return credentialFieldNames.has(normalizeFieldName(field))
      ? [fieldPath]
      : findEmbeddedCredentialPaths(item, fieldPath);
  });
};

const createError = (code, field, message) =>
  Object.freeze({ code, field, message });

const createResult = (errors, configuration = null) =>
  Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    configuration: errors.length === 0 ? configuration : null,
  });

export class GeminiConfigurationValidator {
  validate(candidate) {
    if (!isRecord(candidate)) {
      return createResult([
        createError(
          "invalid-type",
          "configuration",
          "Gemini configuration must be an object."
        ),
      ]);
    }

    const errors = [];

    findEmbeddedCredentialPaths(candidate).forEach((field) =>
      errors.push(
        createError(
          "embedded-credential",
          field,
          "Raw or embedded credentials are not allowed."
        )
      )
    );

    Object.keys(candidate)
      .filter((field) => !GEMINI_CONFIGURATION_FIELDS.includes(field))
      .forEach((field) =>
        errors.push(
          createError(
            "unknown-field",
            `configuration.${field}`,
            "Unknown Gemini configuration field."
          )
        )
      );

    if (!Object.hasOwn(candidate, "providerId")) {
      errors.push(
        createError(
          "required-field",
          "configuration.providerId",
          "providerId is required."
        )
      );
    } else if (candidate.providerId !== GEMINI_PROVIDER_ID) {
      errors.push(
        createError(
          "invalid-provider",
          "configuration.providerId",
          "providerId must be gemini."
        )
      );
    }

    if (!Object.hasOwn(candidate, "enabled")) {
      errors.push(
        createError(
          "required-field",
          "configuration.enabled",
          "enabled is required."
        )
      );
    } else if (typeof candidate.enabled !== "boolean") {
      errors.push(
        createError(
          "invalid-type",
          "configuration.enabled",
          "enabled must be a boolean."
        )
      );
    }

    if (
      candidate.defaultModel !== undefined &&
      candidate.defaultModel !== null &&
      !findGeminiModel(candidate.defaultModel)
    ) {
      errors.push(
        createError(
          "unsupported-model",
          "configuration.defaultModel",
          "The configured Gemini model is not supported."
        )
      );
    }

    if (errors.length > 0) {
      return createResult(errors);
    }

    try {
      return createResult([], new GeminiConfiguration(candidate));
    } catch (error) {
      return createResult([
        createError(
          "invalid-configuration",
          "configuration",
          error instanceof Error
            ? error.message
            : "Gemini configuration is malformed."
        ),
      ]);
    }
  }
}
