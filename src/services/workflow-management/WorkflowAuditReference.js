import { cloneValue } from "./WorkflowManagementValue";

export class WorkflowAuditReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workflowInstanceReference ||
      !definition?.auditReference
    )
      throw new TypeError(
        "WorkflowAuditReference requires id, workflowInstanceReference, and auditReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowInstanceReference = definition.workflowInstanceReference;
    this.auditReference = definition.auditReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
