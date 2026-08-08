import { IdentityType } from "./IdentityType";

const identityTypes = new Set(Object.values(IdentityType));

export class IdentityReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !identityTypes.has(definition?.type) ||
      !definition?.externalReference
    )
      throw new TypeError(
        "IdentityReference requires id, a supported type, and externalReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.externalReference = definition.externalReference;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
