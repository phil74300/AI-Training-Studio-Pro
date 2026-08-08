import { cloneValue } from "./WorkflowManagementValue";
import { WorkflowState } from "./WorkflowState";

const states = new Set(Object.values(WorkflowState));

export class WorkflowInstance {
  constructor(definition) {
    if (!definition?.id || !definition?.workflowDefinitionReference)
      throw new TypeError(
        "WorkflowInstance requires id and workflowDefinitionReference."
      );
    const state = definition.state || WorkflowState.CREATED;
    if (!states.has(state))
      throw new TypeError("WorkflowInstance requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowDefinitionReference = definition.workflowDefinitionReference;
    this.stepReferences = Object.freeze([...(definition.stepReferences || [])]);
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
