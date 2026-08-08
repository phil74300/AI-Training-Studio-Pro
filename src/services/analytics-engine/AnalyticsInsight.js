import { InsightRecommendation } from "./InsightRecommendation";

export const AnalyticsInsightStatus = "INSIGHT_PROPOSAL_ONLY";

export class AnalyticsInsight {
  constructor(definition) {
    if (!definition?.id || !definition?.title || !definition?.description)
      throw new TypeError(
        "AnalyticsInsight requires id, title, and description."
      );
    if (
      definition.confidence !== undefined &&
      (typeof definition.confidence !== "number" ||
        definition.confidence < 0 ||
        definition.confidence > 1)
    )
      throw new TypeError(
        "AnalyticsInsight confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description;
    this.insightType = definition.insightType || "trend";
    this.indicatorReferences = Object.freeze([
      ...(definition.indicatorReferences || []),
    ]);
    this.recommendations = Object.freeze(
      (definition.recommendations || []).map((recommendation) =>
        recommendation instanceof InsightRecommendation
          ? recommendation
          : new InsightRecommendation(recommendation)
      )
    );
    this.confidence = definition.confidence ?? null;
    this.status = AnalyticsInsightStatus;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
