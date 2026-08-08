import { cloneValue } from "./VisualAuthoringValue";

export class AssessmentElement {
  constructor(definition) {
    if (!definition?.id || !definition?.assessmentReference)
      throw new TypeError(
        "AssessmentElement requires id and assessmentReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.assessmentReference = definition.assessmentReference;
    this.elementType = definition.elementType || null;
    this.evaluationActivityReference =
      definition.evaluationActivityReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
