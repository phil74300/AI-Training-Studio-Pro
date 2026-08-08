export class AccessScope {
  constructor(definition) {
    if (!definition?.id || !definition?.membershipId || !definition?.domain)
      throw new TypeError("AccessScope requires id, membershipId, and domain.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.membershipId = definition.membershipId;
    this.domain = definition.domain;
    this.reference = definition.reference || null;
    this.description = definition.description || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
