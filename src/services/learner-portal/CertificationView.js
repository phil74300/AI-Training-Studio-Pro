import { cloneValue } from "./LearnerPortalValue";
export class CertificationView {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.certificationReference ||
      !definition?.validityReference
    )
      throw new TypeError(
        "CertificationView requires id, certificationReference, and validityReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.certificationReference = definition.certificationReference;
    this.validityReference = definition.validityReference;
    this.expiryReference = definition.expiryReference || null;
    this.renewalReference = definition.renewalReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
