import { AIAction } from "../AIAction";
import { TrainingDocument } from "../../training-document/TrainingDocument";
import { ImprovementCategory } from "./ImprovementCategory";
import { ImprovementImpact } from "./ImprovementImpact";
import { ImprovementPriority } from "./ImprovementPriority";
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import { ImprovementSuggestionResult } from "./ImprovementSuggestionResult";

const createId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

const requireCoordinator = (value) => {
  if (typeof value?.execute !== "function") {
    throw new TypeError(
      "TrainingImprovementAnalyzer requires an execution coordinator."
    );
  }

  return value;
};

const findReferences = (analysis, predicate) =>
  analysis.analysis.sourceReferences.filter(predicate);

const deriveSuggestions = (analysis) => {
  const missing = analysis.analysis.missingPedagogicalElements || [];
  const suggestions = [];
  const add = (category, priority, impact, title, rationale, match) => {
    if (!missing.some((item) => item.toLowerCase().includes(match))) return;

    suggestions.push(
      new ImprovementSuggestion({
        id: createId("improvement"),
        category,
        priority,
        impact,
        title,
        rationale,
        sourceReferences: findReferences(
          analysis,
          (reference) => reference.type === "training-document"
        ),
      })
    );
  };

  add(
    ImprovementCategory.LEARNING_OBJECTIVES,
    ImprovementPriority.HIGH,
    ImprovementImpact.LEARNING_OUTCOMES,
    "Define observable learning objectives",
    "The analysis reports missing learning objectives.",
    "learning objectives"
  );
  add(
    ImprovementCategory.STRUCTURE,
    ImprovementPriority.HIGH,
    ImprovementImpact.STRUCTURE,
    "Clarify the learning structure",
    "The analysis reports missing modules or chapters.",
    "training module"
  );
  add(
    ImprovementCategory.ASSESSMENT,
    ImprovementPriority.HIGH,
    ImprovementImpact.ASSESSMENT_ALIGNMENT,
    "Add an assessment method",
    "The analysis reports no assessment method.",
    "assessment"
  );

  const sections = analysis.analysis.detectedChapters || [];
  if (
    sections.length > 0 &&
    !analysis.analysis.sourceReferences.some(
      (reference) =>
        reference.type === "section" &&
        reference.title.toLowerCase().includes("summary")
    )
  ) {
    suggestions.push(
      new ImprovementSuggestion({
        id: createId("improvement"),
        category: ImprovementCategory.SUMMARY,
        priority: ImprovementPriority.MEDIUM,
        impact: ImprovementImpact.CLARITY,
        title: "Add a learner summary",
        rationale: "No explicitly identified summary section was found.",
        sourceReferences: findReferences(
          analysis,
          (reference) => reference.type === "chapter"
        ),
      })
    );
  }

  return Object.freeze(suggestions);
};

const serializeAnalysis = (analysis) =>
  JSON.stringify({
    sourceDocument: analysis.sourceDocument,
    analysis: analysis.analysis,
  });

export class TrainingImprovementAnalyzer {
  #executionCoordinator;
  #clock;

  constructor({ executionCoordinator, clock = () => new Date() }) {
    this.#executionCoordinator = requireCoordinator(executionCoordinator);
    this.#clock = clock;
  }

  async analyze({
    document: value,
    pedagogicalAnalysis,
    provider,
    ids = {},
    execution = {},
  }) {
    const document = TrainingDocument.from(value);

    if (
      !pedagogicalAnalysis?.reviewRequired ||
      pedagogicalAnalysis.sourceDocument?.id !== document.id
    ) {
      throw new TypeError(
        "Improvement workflow requires a review-gated analysis for the same TrainingDocument."
      );
    }

    const executionIds = {
      taskId: ids.taskId || createId("task"),
      requestId: ids.requestId || createId("request"),
      contextSnapshotId: ids.contextSnapshotId || createId("context"),
      reviewId: ids.reviewId || createId("review"),
      resultId: ids.resultId || createId("result"),
      correlationId: ids.correlationId || createId("improvement"),
    };
    const output = await this.#executionCoordinator.execute({
      ids: executionIds,
      actionId: AIAction.GENERATE_IMPROVEMENT_SUGGESTIONS,
      prompt: {
        templateId: "generate-improvement-suggestions",
        variables: {
          documentTitle: document.title,
          analysisContext: serializeAnalysis(pedagogicalAnalysis),
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
      request: { input: "Generate reviewable improvement suggestions only." },
      execution,
    });

    if (!output.result || !output.review)
      return Object.freeze({ execution: output, result: null });

    return Object.freeze({
      execution: output,
      result: new ImprovementSuggestionResult({
        id: ids.improvementResultId || createId("improvement-result"),
        createdAt: new Date(this.#clock()).toISOString(),
        sourceDocument: {
          id: document.id,
          schemaVersion: document.schemaVersion,
          documentVersion: document.metadata.documentVersion,
          title: document.title,
        },
        analysisReference: {
          id: pedagogicalAnalysis.id,
          schemaId: pedagogicalAnalysis.schemaId,
          schemaVersion: pedagogicalAnalysis.schemaVersion,
        },
        provenance: {
          taskId: output.task.id,
          requestId: output.request.requestId,
          contextSnapshotId: output.contextSnapshot.id,
          reviewId: output.review.id,
          providerId: provider.id,
          modelId: provider.modelId,
          promptTemplateId: output.renderedPrompt.templateId,
          promptVersionId: output.renderedPrompt.versionId,
        },
        suggestions: deriveSuggestions(pedagogicalAnalysis),
      }),
    });
  }
}
