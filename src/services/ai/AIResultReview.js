import { AIResultDecision, AIResultDecisionType } from "./AIResultDecision";
import {
  AIResultReviewStatus,
  isAIResultReviewStatus,
} from "./AIResultReviewStatus";
import { AIResultType } from "./AIResult";

const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
      )
    );
  }

  return value;
};

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalText = (value, field) => {
  return value === null ? null : requireText(value, field);
};

const normalizeTimestamp = (value, field, { required = false } = {}) => {
  if (value === null && !required) {
    return null;
  }

  const timestamp = requireText(value, field);

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError(`${field} must be a valid date-time string.`);
  }

  return timestamp;
};

const normalizeResultReference = (reference) => {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
    throw new TypeError("resultReference must be an object.");
  }

  const schemaVersion = reference.schemaVersion ?? 1;

  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new TypeError("resultReference.schemaVersion must be positive.");
  }

  if (!Object.values(AIResultType).includes(reference.type)) {
    throw new TypeError(`Unsupported AI result type: ${reference.type}`);
  }

  return Object.freeze({
    id: optionalText(reference.id ?? null, "resultReference.id"),
    type: requireText(reference.type, "resultReference.type"),
    schemaVersion,
  });
};

const normalizeSelectedPortions = (portions) => {
  if (!Array.isArray(portions)) {
    throw new TypeError("selectedPortions must be an array.");
  }

  return Object.freeze(
    portions.map((portion) => {
      if (!portion || typeof portion !== "object" || Array.isArray(portion)) {
        throw new TypeError("Selected portions must be objects.");
      }

      return cloneValue(portion);
    })
  );
};

const decisionStatuses = Object.freeze({
  [AIResultDecisionType.ACCEPT]: AIResultReviewStatus.ACCEPTED,
  [AIResultDecisionType.PARTIAL_ACCEPT]:
    AIResultReviewStatus.PARTIALLY_ACCEPTED,
  [AIResultDecisionType.REGENERATE]: AIResultReviewStatus.REGENERATE_REQUESTED,
  [AIResultDecisionType.DISCARD]: AIResultReviewStatus.DISCARDED,
});

const validateLifecycle = (review) => {
  const hasPreview = review.status !== AIResultReviewStatus.PENDING_REVIEW;
  const decisionStatus = review.decision
    ? decisionStatuses[review.decision.type]
    : null;

  if (hasPreview !== (review.previewedAt !== null)) {
    throw new Error(`${review.status} has inconsistent preview metadata.`);
  }

  if (review.status === AIResultReviewStatus.PREVIEWED) {
    if (review.decision !== null || review.decidedAt !== null) {
      throw new Error("Previewed reviews cannot contain a decision.");
    }
  } else if (hasPreview) {
    if (review.decision === null || review.decidedAt === null) {
      throw new Error(`${review.status} requires an explicit decision.`);
    }

    if (
      review.status !== AIResultReviewStatus.APPLIED &&
      review.status !== decisionStatus
    ) {
      throw new Error("Review status does not match its explicit decision.");
    }
  }

  if (review.status === AIResultReviewStatus.PENDING_REVIEW) {
    if (review.decision !== null || review.decidedAt !== null) {
      throw new Error("Pending reviews cannot contain a decision.");
    }
  }

  if (review.decision && review.decision.timestamp !== review.decidedAt) {
    throw new Error("Decision and review timestamps must match.");
  }

  if (review.status === AIResultReviewStatus.PARTIALLY_ACCEPTED) {
    if (review.selectedPortions.length === 0) {
      throw new Error("Partial acceptance requires selected portions.");
    }
  } else if (
    review.status !== AIResultReviewStatus.APPLIED ||
    review.decision?.type !== AIResultDecisionType.PARTIAL_ACCEPT
  ) {
    if (review.selectedPortions.length > 0) {
      throw new Error("Only partial acceptance may select result portions.");
    }
  }

  if (review.status === AIResultReviewStatus.APPLIED) {
    if (
      ![
        AIResultDecisionType.ACCEPT,
        AIResultDecisionType.PARTIAL_ACCEPT,
      ].includes(review.decision?.type)
    ) {
      throw new Error("Only an approved review may become applied.");
    }

    if (review.appliedAt === null) {
      throw new Error("Applied reviews require an application timestamp.");
    }
  } else if (review.appliedAt !== null) {
    throw new Error("Only applied reviews may have an application timestamp.");
  }

  const lifecycleTimes = [
    [review.previewedAt, review.createdAt, "Preview cannot precede creation."],
    [review.decidedAt, review.previewedAt, "Decision cannot precede preview."],
    [
      review.appliedAt,
      review.decidedAt,
      "Application cannot precede decision.",
    ],
  ];

  lifecycleTimes.forEach(([timestamp, minimum, message]) => {
    if (
      timestamp !== null &&
      minimum !== null &&
      Date.parse(timestamp) < Date.parse(minimum)
    ) {
      throw new Error(message);
    }
  });
};

export const AI_RESULT_REVIEW_SCHEMA_VERSION = 1;

export class AIResultReview {
  constructor({
    schemaVersion = AI_RESULT_REVIEW_SCHEMA_VERSION,
    id,
    taskId,
    resultReference,
    projectId = null,
    chapterId = null,
    status = AIResultReviewStatus.PENDING_REVIEW,
    createdAt,
    previewedAt = null,
    decidedAt = null,
    appliedAt = null,
    selectedPortions = [],
    decision = null,
    correlationId,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Result review schemaVersion must be positive.");
    }

    if (!isAIResultReviewStatus(status)) {
      throw new TypeError(`Unsupported result review status: ${status}`);
    }

    this.schemaVersion = schemaVersion;
    this.id = requireText(id, "Result review id");
    this.taskId = requireText(taskId, "Result review taskId");
    this.resultReference = normalizeResultReference(resultReference);
    this.resultSchemaReference = Object.freeze({
      type: this.resultReference.type,
      schemaVersion: this.resultReference.schemaVersion,
    });
    this.projectId = optionalText(projectId, "projectId");
    this.chapterId = optionalText(chapterId, "chapterId");

    if (this.chapterId !== null && this.projectId === null) {
      throw new Error("A chapter-scoped review requires a projectId.");
    }

    this.status = status;
    this.createdAt = normalizeTimestamp(createdAt, "createdAt", {
      required: true,
    });
    this.previewedAt = normalizeTimestamp(previewedAt, "previewedAt");
    this.decidedAt = normalizeTimestamp(decidedAt, "decidedAt");
    this.appliedAt = normalizeTimestamp(appliedAt, "appliedAt");
    this.selectedPortions = normalizeSelectedPortions(selectedPortions);
    this.decision = decision === null ? null : AIResultDecision.from(decision);
    this.correlationId = requireText(correlationId, "correlationId");

    validateLifecycle(this);
    Object.freeze(this);
  }

  withChanges(changes) {
    return new AIResultReview({ ...this.toRecord(), ...changes });
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      taskId: this.taskId,
      resultReference: this.resultReference,
      projectId: this.projectId,
      chapterId: this.chapterId,
      status: this.status,
      createdAt: this.createdAt,
      previewedAt: this.previewedAt,
      decidedAt: this.decidedAt,
      appliedAt: this.appliedAt,
      selectedPortions: this.selectedPortions,
      decision: this.decision,
      correlationId: this.correlationId,
    };
  }
}
