import { BloomTaxonomyLevel } from "./BloomTaxonomyLevel";

const taxonomyLevels = new Set(Object.values(BloomTaxonomyLevel));

export class LearningObjective {
  constructor(definition) {
    if (!definition?.id || !definition?.description)
      throw new TypeError("LearningObjective requires id and description.");
    const taxonomyLevel = definition.taxonomyLevel || null;
    if (taxonomyLevel && !taxonomyLevels.has(taxonomyLevel))
      throw new TypeError("LearningObjective requires a Bloom taxonomy level.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.description = definition.description;
    this.competencyReference = definition.competencyReference || null;
    this.evaluationCriteria = Object.freeze([
      ...(definition.evaluationCriteria || []),
    ]);
    this.taxonomyLevel = taxonomyLevel;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
