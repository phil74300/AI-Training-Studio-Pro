import { cloneValue } from "./QualityPortalValue";
export class TrainerQualityView {
  constructor(d) {
    if (!d?.id) throw new TypeError("TrainerQualityView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainerReferences = Object.freeze([...(d.trainerReferences || [])]);
    this.feedbackIndicatorReferences = Object.freeze([
      ...(d.feedbackIndicatorReferences || []),
    ]);
    this.qualityScoreReferences = Object.freeze([
      ...(d.qualityScoreReferences || []),
    ]);
    this.improvementReferences = Object.freeze([
      ...(d.improvementReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
