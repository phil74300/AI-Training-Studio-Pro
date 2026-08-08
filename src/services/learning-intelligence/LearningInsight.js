import { ConfidenceScore } from "./ConfidenceScore";
import { InsightCategory } from "./InsightCategory";
import { IntelligenceStatus } from "./IntelligenceStatus";
import { cloneValue } from "./IntelligenceValue";

const categories = new Set(Object.values(InsightCategory));
const statuses = new Set(Object.values(IntelligenceStatus));

export class LearningInsight {
  constructor(definition) {
    if (
      !definition?.id ||
      !categories.has(definition?.category) ||
      !definition?.description ||
      !definition?.creationReference
    )
      throw new TypeError(
        "LearningInsight requires id, a supported category, description, and creationReference."
      );
    const status = definition.status || IntelligenceStatus.GENERATED;
    if (!statuses.has(status))
      throw new TypeError("LearningInsight requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.category = definition.category;
    this.description = definition.description;
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.rationale = definition.rationale || null;
    this.confidence = ConfidenceScore.from(definition.confidence);
    this.creationReference = definition.creationReference;
    this.status = status;
    this.proposalOnly = true;
    this.reviewRequired = true;
    this.organizationScopeReference =
      definition.organizationScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
