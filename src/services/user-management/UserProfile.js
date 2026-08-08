import { UserStatus } from "./UserStatus";

const statuses = new Set(Object.values(UserStatus));

export class UserProfile {
  constructor(definition) {
    if (!definition?.id || !definition?.displayNameReference)
      throw new TypeError("UserProfile requires id and displayNameReference.");
    const status = definition.status || UserStatus.ACTIVE;
    if (!statuses.has(status))
      throw new TypeError("UserProfile requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.displayNameReference = definition.displayNameReference;
    this.contactReference = definition.contactReference || null;
    this.status = status;
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
