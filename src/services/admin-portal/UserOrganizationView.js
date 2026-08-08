import { cloneValue } from "./AdminPortalValue";
export class UserOrganizationView {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "UserOrganizationView requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.learnerReferences = Object.freeze([...(d.learnerReferences || [])]);
    this.trainerReferences = Object.freeze([...(d.trainerReferences || [])]);
    this.organizationReference = d.organizationReference;
    this.roleReferences = Object.freeze([...(d.roleReferences || [])]);
    this.membershipReferences = Object.freeze([
      ...(d.membershipReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
