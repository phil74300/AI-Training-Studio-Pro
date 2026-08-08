import { cloneValue } from "./WorkflowManagementValue";
import { WorkflowState } from "./WorkflowState";

const states = new Set(Object.values(WorkflowState));

export class TaskInstance {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.taskDefinitionReference ||
      !definition?.workflowInstanceReference
    )
      throw new TypeError(
        "TaskInstance requires id, taskDefinitionReference, and workflowInstanceReference."
      );
    const state = definition.state || WorkflowState.CREATED;
    if (!states.has(state))
      throw new TypeError("TaskInstance requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.taskDefinitionReference = definition.taskDefinitionReference;
    this.workflowInstanceReference = definition.workflowInstanceReference;
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
