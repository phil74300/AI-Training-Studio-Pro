export const CREDENTIAL_METADATA_SCHEMA_VERSION = 1;

export const CredentialMetadataStatus = Object.freeze({
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
  "createdAt",
  "updatedAt",
  "status",
]);

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

const normalizeTimestamp = (value, field) => {
  const timestamp = requireText(value, field);
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
};

export class CredentialMetadata {
  constructor(definition) {
    const normalized = requireRecord(definition, "CredentialMetadata");
    const unknownFields = Object.keys(normalized).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      throw new TypeError(
        `CredentialMetadata contains unknown fields: ${unknownFields.join(", ")}`
      );
    }

    const schemaVersion =
      normalized.schemaVersion ?? CREDENTIAL_METADATA_SCHEMA_VERSION;

    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("CredentialMetadata schemaVersion must be positive.");
    }

    if (!Object.values(CredentialMetadataStatus).includes(normalized.status)) {
      throw new TypeError(
        `Unsupported credential status: ${normalized.status}`
      );
    }

    const createdAt = normalizeTimestamp(normalized.createdAt, "createdAt");
    const updatedAt = normalizeTimestamp(normalized.updatedAt, "updatedAt");

    if (Date.parse(updatedAt) < Date.parse(createdAt)) {
      throw new Error("Credential metadata cannot predate its creation.");
    }

    this.schemaVersion = schemaVersion;
    this.credentialId = requireText(normalized.credentialId, "credentialId");
    this.providerId = requireText(normalized.providerId, "providerId");
    this.displayName = requireText(normalized.displayName, "displayName");
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = normalized.status;

    Object.freeze(this);
  }

  static from(metadata) {
    return metadata instanceof CredentialMetadata
      ? metadata
      : new CredentialMetadata(metadata);
  }

  toPublicRecord() {
    return Object.freeze({
      schemaVersion: this.schemaVersion,
      credentialId: this.credentialId,
      providerId: this.providerId,
      displayName: this.displayName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
    });
  }
}
