import { cloneValue } from "./ClientPortalValue";
export class EmployeeManagementView {
  constructor(d) {
    if (!d?.id || !d?.organizationReference)
      throw new TypeError(
        "EmployeeManagementView requires id and organizationReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.organizationReference = d.organizationReference;
    this.employeeReferences = Object.freeze([...(d.employeeReferences || [])]);
    this.organizationGroupReferences = Object.freeze([
      ...(d.organizationGroupReferences || []),
    ]);
    this.assignedTrainingReferences = Object.freeze([
      ...(d.assignedTrainingReferences || []),
    ]);
    this.historyReferences = Object.freeze([...(d.historyReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
