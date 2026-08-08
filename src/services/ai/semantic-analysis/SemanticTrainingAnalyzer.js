import { AIAction } from "../AIAction";
import { TrainingDocument } from "../../training-document/TrainingDocument";
import { AssessmentSuggestionAnalyzer } from "./AssessmentSuggestionAnalyzer";
import { AudienceAnalyzer } from "./AudienceAnalyzer";
import { DifficultyAnalyzer } from "./DifficultyAnalyzer";
import { DocumentStructureAnalyzer } from "./DocumentStructureAnalyzer";
import { LearningObjectiveAnalyzer } from "./LearningObjectiveAnalyzer";
import { PedagogicalAnalysisResult } from "./PedagogicalAnalysisResult";
import { PedagogicalIssueAnalyzer } from "./PedagogicalIssueAnalyzer";

const requireCoordinator = (coordinator) => {
  if (typeof coordinator?.execute !== "function") {
    throw new TypeError(
      "SemanticTrainingAnalyzer requires an execution coordinator."
    );
  }

  return coordinator;
};

const createId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

const optionalText = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const textList = (value) =>
  Object.freeze(
    Array.isArray(value) ? value.map(optionalText).filter(Boolean) : []
  );

const assessmentMethods = (value) =>
  Object.freeze(
    Array.isArray(value)
      ? value
          .filter(
            (item) => item && typeof item === "object" && !Array.isArray(item)
          )
          .map((item) => ({
            method: optionalText(item.method),
            rationale: optionalText(item.rationale),
          }))
          .filter((item) => item.method && item.rationale)
      : []
  );

const confidenceScores = (value) =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(
        value && typeof value === "object" && !Array.isArray(value) ? value : {}
      ).filter(
        ([, score]) => Number.isFinite(score) && score >= 0 && score <= 1
      )
    )
  );

const normalizeGeneratedAnalysis = (payload) => {
  if (typeof payload !== "string") {
    return Object.freeze({
      value: Object.freeze({}),
      warnings: Object.freeze(["Provider analysis is not textual JSON."]),
    });
  }

  try {
    const value = JSON.parse(payload);

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("Provider analysis must be an object.");
    }

    return Object.freeze({
      value: Object.freeze({
        documentSummary: optionalText(value.documentSummary),
        detectedSubjects: textList(value.detectedSubjects),
        detectedAudience: optionalText(value.detectedAudience),
        estimatedLearnerLevel: [
          "beginner",
          "intermediate",
          "expert",
          "unknown",
        ].includes(value.estimatedLearnerLevel)
          ? value.estimatedLearnerLevel
          : null,
        suggestedAssessmentMethods: assessmentMethods(
          value.suggestedAssessmentMethods
        ),
        suggestedImprovements: textList(value.suggestedImprovements),
        missingPedagogicalElements: textList(value.missingPedagogicalElements),
        potentialInconsistencies: textList(value.potentialInconsistencies),
        warnings: textList(value.warnings),
        confidenceScores: confidenceScores(value.confidenceScores),
      }),
      warnings: Object.freeze([]),
    });
  } catch {
    return Object.freeze({
      value: Object.freeze({}),
      warnings: Object.freeze([
        "Provider analysis could not be parsed as JSON.",
      ]),
    });
  }
};

const serializeDocumentContext = (document, structure, objectives) =>
  JSON.stringify({
    title: document.title,
    description: document.description,
    modules: structure.modules,
    chapters: structure.chapters,
    sections: structure.sections,
    learningObjectives: objectives.objectives,
  });

export class SemanticTrainingAnalyzer {
  #executionCoordinator;
  #structureAnalyzer;
  #learningObjectiveAnalyzer;
  #audienceAnalyzer;
  #difficultyAnalyzer;
  #assessmentSuggestionAnalyzer;
  #pedagogicalIssueAnalyzer;
  #clock;

  constructor({
    executionCoordinator,
    structureAnalyzer = new DocumentStructureAnalyzer(),
    learningObjectiveAnalyzer = new LearningObjectiveAnalyzer(),
    audienceAnalyzer = new AudienceAnalyzer(),
    difficultyAnalyzer = new DifficultyAnalyzer(),
    assessmentSuggestionAnalyzer = new AssessmentSuggestionAnalyzer(),
    pedagogicalIssueAnalyzer = new PedagogicalIssueAnalyzer(),
    clock = () => new Date(),
  }) {
    this.#executionCoordinator = requireCoordinator(executionCoordinator);
    this.#structureAnalyzer = structureAnalyzer;
    this.#learningObjectiveAnalyzer = learningObjectiveAnalyzer;
    this.#audienceAnalyzer = audienceAnalyzer;
    this.#difficultyAnalyzer = difficultyAnalyzer;
    this.#assessmentSuggestionAnalyzer = assessmentSuggestionAnalyzer;
    this.#pedagogicalIssueAnalyzer = pedagogicalIssueAnalyzer;

    if (typeof clock !== "function") {
      throw new TypeError("SemanticTrainingAnalyzer clock must be a function.");
    }

    this.#clock = clock;
  }

  async analyze({ document: value, provider, ids = {}, execution = {} }) {
    const document = TrainingDocument.from(value);
    const structure = this.#structureAnalyzer.analyze(document);
    const objectives = this.#learningObjectiveAnalyzer.analyze(document);
    const audience = this.#audienceAnalyzer.analyze(document);
    const difficulty = this.#difficultyAnalyzer.analyze(objectives);
    const assessments = this.#assessmentSuggestionAnalyzer.analyze(
      document,
      objectives
    );
    const issues = this.#pedagogicalIssueAnalyzer.analyze(
      document,
      structure,
      objectives,
      assessments
    );
    const executionIds = {
      taskId: ids.taskId || createId("task"),
      requestId: ids.requestId || createId("request"),
      contextSnapshotId: ids.contextSnapshotId || createId("context"),
      reviewId: ids.reviewId || createId("review"),
      resultId: ids.resultId || createId("result"),
      correlationId: ids.correlationId || createId("analysis"),
    };
    const output = await this.#executionCoordinator.execute({
      ids: executionIds,
      actionId: AIAction.ANALYZE_TRAINING_DOCUMENT,
      prompt: {
        templateId: "analyze-training-document",
        variables: {
          documentTitle: document.title,
          documentContext: serializeDocumentContext(
            document,
            structure,
            objectives
          ),
          language: document.metadata.language,
        },
      },
      context: {
        items: [],
        selectedItemIds: [],
        confirmedItemIds: [],
        sourceStates: {},
      },
      provider,
      request: {
        input: "Analyze only the training document supplied in the prompt.",
      },
      execution,
    });

    if (!output.result || !output.review) {
      return Object.freeze({ execution: output, result: null });
    }

    const generated = normalizeGeneratedAnalysis(output.result?.payload);
    const result = new PedagogicalAnalysisResult({
      id: ids.analysisId || createId("pedagogical-analysis"),
      createdAt: new Date(this.#clock()).toISOString(),
      sourceDocument: {
        id: document.id,
        schemaVersion: document.schemaVersion,
        documentVersion: document.metadata.documentVersion,
        title: document.title,
      },
      provenance: {
        taskId: output.task.id,
        requestId: output.request.requestId,
        contextSnapshotId: output.contextSnapshot.id,
        reviewId: output.review?.id || null,
        providerId: provider.id,
        modelId: provider.modelId,
        promptTemplateId: output.renderedPrompt.templateId,
        promptVersionId: output.renderedPrompt.versionId,
      },
      analysis: {
        documentSummary:
          generated.value.documentSummary ||
          document.description ||
          document.title,
        detectedTitle: document.title,
        detectedSubjects:
          generated.value.detectedSubjects || document.metadata.tags,
        detectedAudience: generated.value.detectedAudience || audience.audience,
        estimatedLearnerLevel:
          generated.value.estimatedLearnerLevel || difficulty.level,
        detectedModules: structure.modules,
        detectedChapters: structure.chapters,
        detectedLearningObjectives: objectives.objectives,
        suggestedAssessmentMethods: [
          ...assessments.suggestions,
          ...(Array.isArray(generated.value.suggestedAssessmentMethods)
            ? generated.value.suggestedAssessmentMethods
            : []),
        ],
        suggestedImprovements: Array.isArray(
          generated.value.suggestedImprovements
        )
          ? generated.value.suggestedImprovements
          : [],
        missingPedagogicalElements: [
          ...issues.missingElements,
          ...(Array.isArray(generated.value.missingPedagogicalElements)
            ? generated.value.missingPedagogicalElements
            : []),
        ],
        potentialInconsistencies: [
          ...issues.potentialInconsistencies,
          ...(Array.isArray(generated.value.potentialInconsistencies)
            ? generated.value.potentialInconsistencies
            : []),
        ],
        warnings: [
          ...audience.warnings,
          ...issues.warnings,
          ...(generated.value.warnings || []),
          ...generated.warnings,
        ],
        confidenceScores: {
          structure: 1,
          learningObjectives: objectives.hasObjectives ? 1 : 0,
          audience: audience.confidence,
          difficulty: difficulty.confidence,
          ...(generated.value.confidenceScores || {}),
        },
        sourceReferences: structure.sourceReferences,
      },
    });

    return Object.freeze({ execution: output, result });
  }
}
