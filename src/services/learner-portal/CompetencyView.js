import { cloneValue } from "./LearnerPortalValue";
export class CompetencyView {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.competencyReference ||
      !definition?.levelReference
    )
      throw new TypeError(
        "CompetencyView requires id, competencyReference, and levelReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.competencyReference = definition.competencyReference;
    this.levelReference = definition.levelReference;
    this.evidenceReference = definition.evidenceReference || null;
    this.assessmentReference = definition.assessmentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
