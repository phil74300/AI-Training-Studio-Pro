export const CredentialVerificationStatus = Object.freeze({
  VALID: "VALID",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
  UNKNOWN: "UNKNOWN",
});

const validStatuses = new Set(Object.values(CredentialVerificationStatus));

export class CredentialVerification {
  constructor(definition) {
    if (!definition?.id || !definition?.credentialId)
      throw new TypeError(
        "CredentialVerification requires id and credentialId."
      );
    const status = definition.status || CredentialVerificationStatus.UNKNOWN;
    if (!validStatuses.has(status))
      throw new TypeError(
        "CredentialVerification requires a supported status."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.credentialId = definition.credentialId;
    this.qrReference = definition.qrReference || null;
    this.status = status;
    this.publicInformation = Object.freeze({
      ...(definition.publicInformation || {}),
    });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
