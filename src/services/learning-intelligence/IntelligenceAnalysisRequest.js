import { InsightCategory } from "./InsightCategory";
import { cloneValue } from "./IntelligenceValue";
import { LearningDataReference } from "./LearningDataReference";

const categories = new Set(Object.values(InsightCategory));

export class IntelligenceAnalysisRequest {
  constructor(definition) {
    if (!definition?.id || !definition?.createdAt)
      throw new TypeError(
        "IntelligenceAnalysisRequest requires id and createdAt."
      );
    const requestedCategories = definition.requestedCategories || [];
    if (
      !requestedCategories.length ||
      requestedCategories.some((category) => !categories.has(category))
    )
      throw new TypeError(
        "IntelligenceAnalysisRequest requires supported requested categories."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.dataReferences = Object.freeze(
      (definition.dataReferences || []).map((reference) =>
        reference instanceof LearningDataReference
          ? reference
          : new LearningDataReference(reference)
      )
    );
    this.requestedCategories = Object.freeze([...requestedCategories]);
    this.createdAt = definition.createdAt;
    this.executionCoordinatorReference =
      definition.executionCoordinatorReference || null;
    this.resultReviewReference = definition.resultReviewReference || null;
    this.promptDefinitionReference =
      definition.promptDefinitionReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
