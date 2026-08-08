import { cloneValue } from "./LearningExperienceValue";

export class LearningRecommendation {
  constructor(definition) {
    if (!definition?.id || !definition?.learnerJourneyReference)
      throw new TypeError(
        "LearningRecommendation requires id and learnerJourneyReference."
      );
    if (
      definition.confidence !== undefined &&
      (typeof definition.confidence !== "number" ||
        definition.confidence < 0 ||
        definition.confidence > 1)
    )
      throw new TypeError(
        "LearningRecommendation confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.learnerJourneyReference = definition.learnerJourneyReference;
    this.personalizedPathReferences = Object.freeze([
      ...(definition.personalizedPathReferences || []),
    ]);
    this.remediationReferences = Object.freeze([
      ...(definition.remediationReferences || []),
    ]);
    this.recommendedContentReferences = Object.freeze([
      ...(definition.recommendedContentReferences || []),
    ]);
    this.difficultyAdaptationReference =
      definition.difficultyAdaptationReference || null;
    this.confidence = definition.confidence ?? null;
    this.status = "PROPOSAL_ONLY";
    this.validationState = "PENDING_HUMAN_VALIDATION";
    this.consentReference = definition.consentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
