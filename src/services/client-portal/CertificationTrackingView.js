import { cloneValue } from "./ClientPortalValue";
export class CertificationTrackingView {
  constructor(d) {
    if (!d?.id) throw new TypeError("CertificationTrackingView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.certificateReferences = Object.freeze([
      ...(d.certificateReferences || []),
    ]);
    this.validityReference = d.validityReference || null;
    this.expiryReference = d.expiryReference || null;
    this.renewalReferences = Object.freeze([...(d.renewalReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
