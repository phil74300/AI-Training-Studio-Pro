import { cloneValue } from "./WorkflowManagementValue";

export class WorkflowStep {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workflowDefinitionReference ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "WorkflowStep requires id, workflowDefinitionReference, and an integer order."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowDefinitionReference = definition.workflowDefinitionReference;
    this.order = definition.order;
    this.taskDefinitionReferences = Object.freeze([
      ...(definition.taskDefinitionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
