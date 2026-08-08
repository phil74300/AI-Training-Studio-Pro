import { cloneValue } from "./WorkflowManagementValue";

export class TaskDefinition {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workflowStepReference ||
      !definition?.title
    )
      throw new TypeError(
        "TaskDefinition requires id, workflowStepReference, and title."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowStepReference = definition.workflowStepReference;
    this.title = definition.title;
    this.actionReferences = Object.freeze([
      ...(definition.actionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
