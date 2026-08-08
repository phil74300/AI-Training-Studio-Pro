import { TrainingDocument } from "../../training-document/TrainingDocument";

export class AssessmentSuggestionAnalyzer {
  analyze(value, objectiveAnalysis) {
    const document = TrainingDocument.from(value);
    const assessments = [
      ...document.assessments,
      ...document.modules.flatMap((module) => [
        ...module.assessments,
        ...module.chapters.flatMap((chapter) => [
          ...chapter.assessments,
          ...chapter.sections.flatMap((section) => section.assessments),
        ]),
      ]),
    ];
    const assessedObjectiveIds = new Set(
      assessments.flatMap((assessment) => assessment.objectiveIds)
    );
    const uncoveredObjectives = objectiveAnalysis.objectives.filter(
      (objective) => !assessedObjectiveIds.has(objective.id)
    );
    const suggestions = uncoveredObjectives.map((objective) => ({
      method: objective.domain === "skill" ? "practical" : "self-check",
      rationale: `No existing assessment is linked to the objective: ${objective.statement}`,
      objectiveIds: [objective.id],
      sourceReferences: [objective.sourceReference],
    }));

    return Object.freeze({
      existingAssessmentCount: assessments.length,
      suggestions: Object.freeze(
        suggestions.map((suggestion) =>
          Object.freeze({
            ...suggestion,
            objectiveIds: Object.freeze(suggestion.objectiveIds),
            sourceReferences: Object.freeze(suggestion.sourceReferences),
          })
        )
      ),
    });
  }
}
