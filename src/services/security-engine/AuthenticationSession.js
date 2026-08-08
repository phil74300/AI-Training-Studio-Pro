import { AuthenticationSessionStatus } from "./AuthenticationSessionStatus";

const statuses = new Set(Object.values(AuthenticationSessionStatus));

export class AuthenticationSession {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.identityReference ||
      !definition?.createdAt ||
      !definition?.expiresAt
    )
      throw new TypeError(
        "AuthenticationSession requires id, identityReference, createdAt, and expiresAt."
      );
    const status = definition.status || AuthenticationSessionStatus.ACTIVE;
    const createdAt = new Date(definition.createdAt);
    const expiresAt = new Date(definition.expiresAt);
    if (!statuses.has(status))
      throw new TypeError("AuthenticationSession requires a supported status.");
    if (Number.isNaN(createdAt.getTime()) || Number.isNaN(expiresAt.getTime()))
      throw new TypeError("AuthenticationSession requires valid timestamps.");
    if (expiresAt < createdAt)
      throw new TypeError(
        "AuthenticationSession expiration must follow creation."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identityReference = definition.identityReference;
    this.createdAt = createdAt.toISOString();
    this.expiresAt = expiresAt.toISOString();
    this.status = status;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
