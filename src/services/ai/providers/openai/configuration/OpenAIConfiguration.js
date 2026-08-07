import {
  CredentialReference,
  CredentialReferenceStatus,
} from "./CredentialReference";
import { OPENAI_PROVIDER_ID } from "../OpenAIModelDescriptor";

export const OPENAI_CONFIGURATION_SCHEMA_VERSION = 1;
export const OPENAI_TIMEOUT_MIN_MS = 1_000;
export const OPENAI_TIMEOUT_MAX_MS = 300_000;

export const OPENAI_CONFIGURATION_FIELDS = Object.freeze([
  "schemaVersion",
  "providerId",
  "enabled",
  "defaultModel",
  "timeoutMs",
  "retryPolicy",
  "organizationId",
  "projectId",
  "credentialReference",
]);

const RETRY_POLICY_FIELDS = Object.freeze(["mode", "maxAttempts"]);

const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return value;
};

const optionalText = (value, field) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string or null.`);
  }

  return value.trim();
};

const rejectUnknownFields = (value, allowed, field) => {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));

  if (unknown.length > 0) {
    throw new TypeError(
      `${field} contains unknown fields: ${unknown.join(", ")}`
    );
  }
};

const normalizeRetryPolicy = (retryPolicy = {}) => {
  const normalized = requireRecord(retryPolicy, "retryPolicy");

  rejectUnknownFields(normalized, RETRY_POLICY_FIELDS, "retryPolicy");

  const mode = normalized.mode ?? "none";
  const maxAttempts = normalized.maxAttempts ?? 1;

  if (mode !== "none" || maxAttempts !== 1) {
    throw new TypeError(
      "OpenAI retries must remain disabled during the configuration foundation."
    );
  }

  return Object.freeze({ mode, maxAttempts });
};

export class OpenAIConfiguration {
  constructor(definition) {
    const normalized = requireRecord(definition, "OpenAIConfiguration");

    rejectUnknownFields(
      normalized,
      OPENAI_CONFIGURATION_FIELDS,
      "OpenAIConfiguration"
    );

    const schemaVersion =
      normalized.schemaVersion ?? OPENAI_CONFIGURATION_SCHEMA_VERSION;
    const providerId = normalized.providerId;
    const enabled = normalized.enabled;
    const defaultModel = optionalText(
      normalized.defaultModel ?? null,
      "defaultModel"
    );
    const timeoutMs = normalized.timeoutMs ?? 30_000;
    const credentialReference =
      normalized.credentialReference === null ||
      normalized.credentialReference === undefined
        ? null
        : CredentialReference.from(normalized.credentialReference);

    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError(
        "OpenAI configuration schemaVersion must be positive."
      );
    }

    if (providerId !== OPENAI_PROVIDER_ID) {
      throw new TypeError(`providerId must be ${OPENAI_PROVIDER_ID}.`);
    }

    if (typeof enabled !== "boolean") {
      throw new TypeError("enabled must be a boolean.");
    }

    if (
      !Number.isInteger(timeoutMs) ||
      timeoutMs < OPENAI_TIMEOUT_MIN_MS ||
      timeoutMs > OPENAI_TIMEOUT_MAX_MS
    ) {
      throw new TypeError(
        `timeoutMs must be between ${OPENAI_TIMEOUT_MIN_MS} and ${OPENAI_TIMEOUT_MAX_MS}.`
      );
    }

    if (
      credentialReference !== null &&
      credentialReference.providerId !== OPENAI_PROVIDER_ID
    ) {
      throw new TypeError("Credential reference provider must be openai.");
    }

    if (
      enabled &&
      (!defaultModel ||
        credentialReference?.status !== CredentialReferenceStatus.AVAILABLE)
    ) {
      throw new TypeError(
        "Enabled OpenAI configuration requires a default model and available credential reference."
      );
    }

    this.schemaVersion = schemaVersion;
    this.providerId = providerId;
    this.enabled = enabled;
    this.defaultModel = defaultModel;
    this.timeoutMs = timeoutMs;
    this.retryPolicy = normalizeRetryPolicy(normalized.retryPolicy);
    this.organizationId = optionalText(
      normalized.organizationId ?? null,
      "organizationId"
    );
    this.projectId = optionalText(normalized.projectId ?? null, "projectId");
    this.credentialReference = credentialReference;

    Object.freeze(this);
  }

  get configured() {
    return Boolean(
      this.defaultModel &&
      this.credentialReference?.status === CredentialReferenceStatus.AVAILABLE
    );
  }
}
