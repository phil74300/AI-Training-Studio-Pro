export class PortalContext {
  constructor(definition) {
    if (!definition?.id || !definition?.userId || !definition?.organizationId)
      throw new TypeError(
        "PortalContext requires id, userId, and organizationId."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userId = definition.userId;
    this.organizationId = definition.organizationId;
    this.membershipIds = Object.freeze([...(definition.membershipIds || [])]);
    this.roleReferences = Object.freeze([...(definition.roleReferences || [])]);
    this.accessScopeIds = Object.freeze([...(definition.accessScopeIds || [])]);
    this.domainReferences = Object.freeze({
      learning: Object.freeze([
        ...(definition.domainReferences?.learning || []),
      ]),
      certification: Object.freeze([
        ...(definition.domainReferences?.certification || []),
      ]),
      quality: Object.freeze([...(definition.domainReferences?.quality || [])]),
      analytics: Object.freeze([
        ...(definition.domainReferences?.analytics || []),
      ]),
      delivery: Object.freeze([
        ...(definition.domainReferences?.delivery || []),
      ]),
    });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
