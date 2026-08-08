import { cloneValue } from "./AdminPortalValue";
export class CertificationAdministrationView {
  constructor(d) {
    if (!d?.id)
      throw new TypeError("CertificationAdministrationView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.certificationReferences = Object.freeze([
      ...(d.certificationReferences || []),
    ]);
    this.issuedCredentialReferences = Object.freeze([
      ...(d.issuedCredentialReferences || []),
    ]);
    this.validityReferences = Object.freeze([...(d.validityReferences || [])]);
    this.renewalReferences = Object.freeze([...(d.renewalReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
