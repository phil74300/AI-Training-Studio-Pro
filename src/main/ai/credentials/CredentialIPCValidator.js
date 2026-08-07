import {
  CREDENTIAL_IPC_CONTRACT_VERSION,
  CredentialIPCOperation,
} from "./CredentialIPCContract";

const identifierPattern = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const supportedOperations = Object.freeze(
  Object.values(CredentialIPCOperation)
);
const mutationOperations = Object.freeze([
  CredentialIPCOperation.CREATE,
  CredentialIPCOperation.REPLACE,
]);
const identityOperations = Object.freeze([
  CredentialIPCOperation.REMOVE,
  CredentialIPCOperation.EXISTS,
]);
const messageFields = Object.freeze([
  "contractVersion",
  "operation",
  "payload",
]);
const payloadFields = Object.freeze({
  mutation: Object.freeze([
    "providerId",
    "credentialId",
    "displayName",
    "secret",
  ]),
  identity: Object.freeze(["providerId", "credentialId"]),
  list: Object.freeze(["providerId"]),
});

const isRecord = (value) =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const createError = (code, field, message) =>
  Object.freeze({ code, field, message });

const rejectUnknownFields = (value, allowedFields, field, errors) => {
  Object.keys(value)
    .filter((key) => !allowedFields.includes(key))
    .forEach((key) =>
      errors.push(
        createError(
          "unknown-field",
          `${field}.${key}`,
          "Unknown credential IPC field."
        )
      )
    );
};

const validateIdentifier = (value, field, errors) => {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    errors.push(
      createError("invalid-identifier", field, "Identifier format is invalid.")
    );
  }
};

export class CredentialIPCValidator {
  #supportedProviderIds;

  constructor({ supportedProviderIds = ["openai"] } = {}) {
    if (
      !Array.isArray(supportedProviderIds) ||
      supportedProviderIds.length === 0 ||
      supportedProviderIds.some(
        (providerId) =>
          typeof providerId !== "string" || !identifierPattern.test(providerId)
      )
    ) {
      throw new TypeError(
        "CredentialIPCValidator requires supported provider identifiers."
      );
    }

    this.#supportedProviderIds = Object.freeze([
      ...new Set(supportedProviderIds),
    ]);
  }

  validate(message) {
    if (!isRecord(message)) {
      return this.#createResult([
        createError(
          "invalid-message",
          "message",
          "Credential IPC message must be an object."
        ),
      ]);
    }

    const errors = [];

    rejectUnknownFields(message, messageFields, "message", errors);

    if (message.contractVersion !== CREDENTIAL_IPC_CONTRACT_VERSION) {
      errors.push(
        createError(
          "unsupported-version",
          "message.contractVersion",
          "Credential IPC contract version is unsupported."
        )
      );
    }

    if (!supportedOperations.includes(message.operation)) {
      errors.push(
        createError(
          "unsupported-operation",
          "message.operation",
          "Credential IPC operation is unsupported."
        )
      );
    }

    if (!isRecord(message.payload)) {
      errors.push(
        createError(
          "invalid-payload",
          "message.payload",
          "Credential IPC payload must be an object."
        )
      );

      return this.#createResult(errors);
    }

    if (!supportedOperations.includes(message.operation)) {
      return this.#createResult(errors);
    }

    const allowedFields = mutationOperations.includes(message.operation)
      ? payloadFields.mutation
      : identityOperations.includes(message.operation)
        ? payloadFields.identity
        : payloadFields.list;

    rejectUnknownFields(
      message.payload,
      allowedFields,
      "message.payload",
      errors
    );
    validateIdentifier(
      message.payload.providerId,
      "message.payload.providerId",
      errors
    );

    if (
      typeof message.payload.providerId === "string" &&
      identifierPattern.test(message.payload.providerId) &&
      !this.#supportedProviderIds.includes(message.payload.providerId)
    ) {
      errors.push(
        createError(
          "unsupported-provider",
          "message.payload.providerId",
          "Credential provider is unsupported."
        )
      );
    }

    if (allowedFields.includes("credentialId")) {
      validateIdentifier(
        message.payload.credentialId,
        "message.payload.credentialId",
        errors
      );
    }

    if (mutationOperations.includes(message.operation)) {
      if (
        typeof message.payload.displayName !== "string" ||
        !message.payload.displayName.trim() ||
        message.payload.displayName.trim().length > 120
      ) {
        errors.push(
          createError(
            "invalid-display-name",
            "message.payload.displayName",
            "Credential display name is invalid."
          )
        );
      }

      if (
        typeof message.payload.secret !== "string" ||
        message.payload.secret.length === 0 ||
        message.payload.secret.length > 65_536
      ) {
        errors.push(
          createError(
            "invalid-secret",
            "message.payload.secret",
            "Credential secret payload is invalid."
          )
        );
      }
    }

    if (errors.length > 0) {
      return this.#createResult(errors);
    }

    return this.#createResult(
      [],
      Object.freeze({
        contractVersion: CREDENTIAL_IPC_CONTRACT_VERSION,
        operation: message.operation,
        payload: Object.freeze({
          ...message.payload,
          ...(Object.hasOwn(message.payload, "displayName")
            ? { displayName: message.payload.displayName.trim() }
            : {}),
        }),
      })
    );
  }

  #createResult(errors, message = null) {
    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
      message: errors.length === 0 ? message : null,
    });
  }
}
