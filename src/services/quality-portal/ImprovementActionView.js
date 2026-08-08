import { cloneValue } from "./QualityPortalValue";
export class ImprovementActionView {
  constructor(d) {
    if (!d?.id || !d?.findingReference || !d?.actionReference)
      throw new TypeError(
        "ImprovementActionView requires id, findingReference, and actionReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.findingReference = d.findingReference;
    this.actionReference = d.actionReference;
    this.responsibleReference = d.responsibleReference || null;
    this.deadlineReference = d.deadlineReference || null;
    this.validationReference = d.validationReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
