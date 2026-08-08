import { cloneValue } from "./IntelligenceValue";

export class ImprovementReference {
  constructor(definition) {
    if (!definition?.id || !definition?.improvementActionReference)
      throw new TypeError(
        "ImprovementReference requires id and improvementActionReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.improvementActionReference = definition.improvementActionReference;
    this.sourceProposalReference = definition.sourceProposalReference || null;
    this.qualityReference = definition.qualityReference || null;
    this.analyticsReference = definition.analyticsReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
