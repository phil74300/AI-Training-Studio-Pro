import { LearningTaxonomyLevel } from "../../training-document/TrainingDocumentTypes";

const levelWeights = Object.freeze({
  [LearningTaxonomyLevel.REMEMBER]: 1,
  [LearningTaxonomyLevel.UNDERSTAND]: 1,
  [LearningTaxonomyLevel.APPLY]: 2,
  [LearningTaxonomyLevel.ANALYZE]: 3,
  [LearningTaxonomyLevel.EVALUATE]: 3,
  [LearningTaxonomyLevel.CREATE]: 3,
});

export class DifficultyAnalyzer {
  analyze(objectiveAnalysis) {
    const levels = objectiveAnalysis.objectives
      .map((objective) => objective.taxonomyLevel)
      .filter(Boolean);

    if (levels.length === 0) {
      return Object.freeze({
        level: "unknown",
        confidence: 0,
        rationale: "No explicit objective taxonomy level is available.",
      });
    }

    const average =
      levels.reduce((total, level) => total + levelWeights[level], 0) /
      levels.length;
    const level =
      average < 1.5 ? "beginner" : average < 2.5 ? "intermediate" : "expert";

    return Object.freeze({
      level,
      confidence: 1,
      rationale:
        "Estimated from the explicit taxonomy levels of learning objectives.",
    });
  }
}
