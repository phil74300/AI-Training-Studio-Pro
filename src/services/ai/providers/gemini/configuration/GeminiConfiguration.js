import {
  CredentialReference,
  CredentialReferenceStatus,
} from "../../openai/configuration/CredentialReference";
import { GEMINI_PROVIDER_ID } from "../GeminiModelDescriptor";

export const GEMINI_CONFIGURATION_SCHEMA_VERSION = 1;
export const GEMINI_TIMEOUT_MIN_MS = 1_000;
export const GEMINI_TIMEOUT_MAX_MS = 300_000;

export const GEMINI_CONFIGURATION_FIELDS = Object.freeze([
  "schemaVersion",
  "providerId",
  "enabled",
  "defaultModel",
  "timeoutMs",
  "retryPolicy",
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
    throw new TypeError("Gemini retries are not supported in GEMINI-1.");
  }

  return Object.freeze({ mode, maxAttempts });
};

export class GeminiConfiguration {
  constructor(definition) {
    const normalized = requireRecord(definition, "GeminiConfiguration");

    rejectUnknownFields(
      normalized,
      GEMINI_CONFIGURATION_FIELDS,
      "GeminiConfiguration"
    );

    const schemaVersion =
      normalized.schemaVersion ?? GEMINI_CONFIGURATION_SCHEMA_VERSION;
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
        "Gemini configuration schemaVersion must be positive."
      );
    }

    if (providerId !== GEMINI_PROVIDER_ID) {
      throw new TypeError(`providerId must be ${GEMINI_PROVIDER_ID}.`);
    }

    if (typeof enabled !== "boolean") {
      throw new TypeError("enabled must be a boolean.");
    }

    if (
      !Number.isInteger(timeoutMs) ||
      timeoutMs < GEMINI_TIMEOUT_MIN_MS ||
      timeoutMs > GEMINI_TIMEOUT_MAX_MS
    ) {
      throw new TypeError(
        `timeoutMs must be between ${GEMINI_TIMEOUT_MIN_MS} and ${GEMINI_TIMEOUT_MAX_MS}.`
      );
    }

    if (
      credentialReference !== null &&
      credentialReference.providerId !== GEMINI_PROVIDER_ID
    ) {
      throw new TypeError("Credential reference provider must be gemini.");
    }

    if (
      enabled &&
      (!defaultModel ||
        credentialReference?.status !== CredentialReferenceStatus.AVAILABLE)
    ) {
      throw new TypeError(
        "Enabled Gemini configuration requires a default model and available credential reference."
      );
    }

    this.schemaVersion = schemaVersion;
    this.providerId = providerId;
    this.enabled = enabled;
    this.defaultModel = defaultModel;
    this.timeoutMs = timeoutMs;
    this.retryPolicy = normalizeRetryPolicy(normalized.retryPolicy);
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
