import { cloneValue } from "./WorkflowManagementValue";

export class TaskAssignment {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.taskInstanceReference ||
      !definition?.assigneeReference
    )
      throw new TypeError(
        "TaskAssignment requires id, taskInstanceReference, and assigneeReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.taskInstanceReference = definition.taskInstanceReference;
    this.assigneeReference = definition.assigneeReference;
    this.assignedByReference = definition.assignedByReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
