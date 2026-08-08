import { ExpirationStatus } from "./ExpirationStatus";

const validStatuses = new Set(Object.values(ExpirationStatus));

export class Credential {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.number ||
      !definition?.certificationRecordId ||
      !definition?.learnerId ||
      !definition?.certificateTemplateId ||
      !definition?.issuedAt ||
      !definition?.expiresAt
    )
      throw new TypeError(
        "Credential requires id, number, certificationRecordId, learnerId, certificateTemplateId, issuedAt, and expiresAt."
      );
    const status = definition.status || ExpirationStatus.ACTIVE;
    if (!validStatuses.has(status))
      throw new TypeError("Credential requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.number = definition.number;
    this.certificationRecordId = definition.certificationRecordId;
    this.learnerId = definition.learnerId;
    this.certificateTemplateId = definition.certificateTemplateId;
    this.issuedAt = new Date(definition.issuedAt).toISOString();
    this.expiresAt = new Date(definition.expiresAt).toISOString();
    this.status = status;
    this.history = Object.freeze([...(definition.history || [])]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
