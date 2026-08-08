import { cloneValue } from "./TrainerPortalValue";
export class TrainerQualityView {
  constructor(d) {
    if (!d?.id || !d?.satisfactionReference)
      throw new TypeError(
        "TrainerQualityView requires id and satisfactionReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.satisfactionReference = d.satisfactionReference;
    this.qualityIndicatorReferences = Object.freeze([
      ...(d.qualityIndicatorReferences || []),
    ]);
    this.improvementActionReferences = Object.freeze([
      ...(d.improvementActionReferences || []),
    ]);
    this.evidenceReferences = Object.freeze([...(d.evidenceReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
