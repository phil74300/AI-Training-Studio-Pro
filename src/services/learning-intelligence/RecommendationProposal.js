import { ConfidenceScore } from "./ConfidenceScore";
import { cloneValue } from "./IntelligenceValue";
import { IntelligenceStatus } from "./IntelligenceStatus";
import { RecommendationType } from "./RecommendationType";

const types = new Set(Object.values(RecommendationType));
const statuses = new Set(Object.values(IntelligenceStatus));

export class RecommendationProposal {
  constructor(definition) {
    if (
      !definition?.id ||
      !types.has(definition?.recommendationType) ||
      !definition?.targetReference ||
      !definition?.rationale ||
      !definition?.expectedImpact
    )
      throw new TypeError(
        "RecommendationProposal requires id, a supported recommendationType, targetReference, rationale, and expectedImpact."
      );
    const validationState =
      definition.validationState || IntelligenceStatus.GENERATED;
    if (!statuses.has(validationState))
      throw new TypeError(
        "RecommendationProposal requires a supported validationState."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.recommendationType = definition.recommendationType;
    this.targetReference = definition.targetReference;
    this.rationale = definition.rationale;
    this.expectedImpact = definition.expectedImpact;
    this.confidence = ConfidenceScore.from(definition.confidence);
    this.insightReferences = Object.freeze([
      ...(definition.insightReferences || []),
    ]);
    this.validationState = validationState;
    this.status = "PROPOSAL_ONLY";
    this.reviewRequired = true;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
