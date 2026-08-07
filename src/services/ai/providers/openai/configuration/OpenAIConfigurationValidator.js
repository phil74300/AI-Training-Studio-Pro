import {
  OPENAI_CONFIGURATION_FIELDS,
  OpenAIConfiguration,
} from "./OpenAIConfiguration";
import { findOpenAIModel } from "../OpenAIModelCatalog";
import { OPENAI_PROVIDER_ID } from "../OpenAIModelDescriptor";

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

export class OpenAIConfigurationValidator {
  validate(candidate) {
    if (!isRecord(candidate)) {
      return createResult([
        createError(
          "invalid-type",
          "configuration",
          "OpenAI configuration must be an object."
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
      .filter((field) => !OPENAI_CONFIGURATION_FIELDS.includes(field))
      .forEach((field) =>
        errors.push(
          createError(
            "unknown-field",
            `configuration.${field}`,
            "Unknown OpenAI configuration field."
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
    } else if (candidate.providerId !== OPENAI_PROVIDER_ID) {
      errors.push(
        createError(
          "invalid-provider",
          "configuration.providerId",
          "providerId must be openai."
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
      !findOpenAIModel(candidate.defaultModel)
    ) {
      errors.push(
        createError(
          "unsupported-model",
          "configuration.defaultModel",
          "The configured OpenAI model is not supported."
        )
      );
    }

    if (errors.length > 0) {
      return createResult(errors);
    }

    try {
      return createResult([], new OpenAIConfiguration(candidate));
    } catch (error) {
      return createResult([
        createError(
          "invalid-configuration",
          "configuration",
          error instanceof Error
            ? error.message
            : "OpenAI configuration is malformed."
        ),
      ]);
    }
  }
}
