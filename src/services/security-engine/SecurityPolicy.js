export class SecurityPolicy {
  constructor(definition) {
    if (!definition?.id || !definition?.name)
      throw new TypeError("SecurityPolicy requires id and name.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.name = definition.name;
    this.passwordPolicyReference = definition.passwordPolicyReference || null;
    this.mfaPolicyReference = definition.mfaPolicyReference || null;
    this.sessionPolicyReference = definition.sessionPolicyReference || null;
    this.retentionPolicyReference = definition.retentionPolicyReference || null;
    this.version = definition.version || "1.0";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
