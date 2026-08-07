export const CREDENTIAL_REFERENCE_SCHEMA_VERSION = 1;

export const CredentialReferenceStatus = Object.freeze({
  PENDING: "pending",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  REVOKED: "revoked",
});

const allowedFields = Object.freeze([
  "schemaVersion",
  "credentialId",
  "providerId",
  "displayName",
  "creationMetadata",
  "status",
]);

const allowedCreationMetadataFields = Object.freeze(["createdAt", "createdBy"]);

const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return value;
};

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalText = (value, field) =>
  value === null ? null : requireText(value, field);

const rejectUnknownFields = (value, allowed, field) => {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));

  if (unknown.length > 0) {
    throw new TypeError(
      `${field} contains unknown fields: ${unknown.join(", ")}`
    );
  }
};

const normalizeCreationMetadata = (metadata) => {
  const normalized = requireRecord(metadata, "creationMetadata");

  rejectUnknownFields(
    normalized,
    allowedCreationMetadataFields,
    "creationMetadata"
  );

  const createdAt = requireText(
    normalized.createdAt,
    "creationMetadata.createdAt"
  );

  if (Number.isNaN(Date.parse(createdAt))) {
    throw new TypeError(
      "creationMetadata.createdAt must be a valid timestamp."
    );
  }

  return Object.freeze({
    createdAt: new Date(createdAt).toISOString(),
    createdBy: optionalText(
      normalized.createdBy ?? null,
      "creationMetadata.createdBy"
    ),
  });
};

export class CredentialReference {
  constructor(definition) {
    const normalized = requireRecord(definition, "CredentialReference");

    rejectUnknownFields(normalized, allowedFields, "CredentialReference");

    const schemaVersion =
      normalized.schemaVersion ?? CREDENTIAL_REFERENCE_SCHEMA_VERSION;

    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError(
        "CredentialReference schemaVersion must be positive."
      );
    }

    if (!Object.values(CredentialReferenceStatus).includes(normalized.status)) {
      throw new TypeError(
        `Unsupported credential reference status: ${normalized.status}`
      );
    }

    this.schemaVersion = schemaVersion;
    this.credentialId = requireText(
      normalized.credentialId,
      "CredentialReference credentialId"
    );
    this.providerId = requireText(
      normalized.providerId,
      "CredentialReference providerId"
    );
    this.displayName = requireText(
      normalized.displayName,
      "CredentialReference displayName"
    );
    this.creationMetadata = normalizeCreationMetadata(
      normalized.creationMetadata
    );
    this.status = normalized.status;

    Object.freeze(this);
  }

  static from(reference) {
    return reference instanceof CredentialReference
      ? reference
      : new CredentialReference(reference);
  }
}
