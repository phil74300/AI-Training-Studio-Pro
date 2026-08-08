import { cloneValue } from "./WorkflowManagementValue";

const types = new Set([
  "TRAINING_VALIDATION",
  "CERTIFICATION_RENEWAL",
  "QUALITY_IMPROVEMENT",
  "CLIENT_REQUEST",
  "ASSESSMENT_VALIDATION",
]);

export class WorkflowDefinition {
  constructor(definition) {
    if (!definition?.id || !types.has(definition?.workflowType))
      throw new TypeError(
        "WorkflowDefinition requires id and a supported workflowType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workflowType = definition.workflowType;
    this.title = definition.title || null;
    this.stepReferences = Object.freeze([...(definition.stepReferences || [])]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
