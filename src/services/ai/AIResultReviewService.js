import { AIResultApplicationRequest } from "./AIResultApplicationRequest";
import { AIResultDecision, AIResultDecisionType } from "./AIResultDecision";
import { AIResultPreview } from "./AIResultPreview";
import { AIResultReview } from "./AIResultReview";
import {
  AIResultReviewStatus,
  assertAIResultReviewStatusTransition,
} from "./AIResultReviewStatus";

const decisionStatuses = Object.freeze({
  [AIResultDecisionType.ACCEPT]: AIResultReviewStatus.ACCEPTED,
  [AIResultDecisionType.PARTIAL_ACCEPT]:
    AIResultReviewStatus.PARTIALLY_ACCEPTED,
  [AIResultDecisionType.REGENERATE]: AIResultReviewStatus.REGENERATE_REQUESTED,
  [AIResultDecisionType.DISCARD]: AIResultReviewStatus.DISCARDED,
});

const normalizeTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Result review clock must return a valid date.");
  }

  return date.toISOString();
};

const referencesMatch = (left, right) =>
  left.id === right.id &&
  left.type === right.type &&
  left.schemaVersion === right.schemaVersion;

export class AIResultReviewService {
  #reviews = new Map();

  #previews = new Map();

  #applicationRequests = new Map();

  #clock;

  constructor({ clock = () => new Date() } = {}) {
    if (typeof clock !== "function") {
      throw new TypeError("AIResultReviewService clock must be a function.");
    }

    this.#clock = clock;
  }

  createReview(definition) {
    const timestamp = this.#now();
    const review = new AIResultReview({
      ...definition,
      status: AIResultReviewStatus.PENDING_REVIEW,
      createdAt: timestamp,
      previewedAt: null,
      decidedAt: null,
      appliedAt: null,
      selectedPortions: [],
      decision: null,
    });

    if (this.#reviews.has(review.id)) {
      throw new Error(`AI result review already exists: ${review.id}`);
    }

    const duplicate = [...this.#reviews.values()].find(
      (candidate) =>
        candidate.taskId === review.taskId &&
        referencesMatch(candidate.resultReference, review.resultReference)
    );

    if (duplicate) {
      throw new Error(`AI result already has a review: ${duplicate.id}`);
    }

    this.#reviews.set(review.id, review);

    return review;
  }

  getReview(reviewId) {
    return this.#reviews.get(reviewId) || null;
  }

  requireReview(reviewId) {
    const review = this.getReview(reviewId);

    if (!review) {
      throw new Error(`Unknown AI result review: ${reviewId}`);
    }

    return review;
  }

  listReviews({ taskId = null, projectId = null, status = null } = {}) {
    return Object.freeze(
      [...this.#reviews.values()]
        .filter((review) => taskId === null || review.taskId === taskId)
        .filter(
          (review) => projectId === null || review.projectId === projectId
        )
        .filter((review) => status === null || review.status === status)
        .sort(
          (left, right) =>
            Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
            left.id.localeCompare(right.id)
        )
    );
  }

  markPreviewed(reviewId, previewDefinition) {
    const review = this.requireReview(reviewId);

    assertAIResultReviewStatusTransition(
      review.status,
      AIResultReviewStatus.PREVIEWED
    );

    const timestamp = this.#now();
    const preview = new AIResultPreview({
      ...previewDefinition,
      reviewId: review.id,
      taskId: review.taskId,
      resultReference: review.resultReference,
      createdAt: timestamp,
    });
    const updatedReview = review.withChanges({
      status: AIResultReviewStatus.PREVIEWED,
      previewedAt: timestamp,
    });

    this.#previews.set(review.id, preview);
    this.#reviews.set(review.id, updatedReview);

    return updatedReview;
  }

  getPreview(reviewId) {
    return this.#previews.get(reviewId) || null;
  }

  recordDecision(reviewId, decisionDefinition) {
    const review = this.requireReview(reviewId);
    const timestamp = this.#now();
    const decision = new AIResultDecision({
      ...decisionDefinition,
      timestamp,
    });
    const nextStatus = decisionStatuses[decision.type];

    assertAIResultReviewStatusTransition(review.status, nextStatus);

    const selectedPortions =
      decision.type === AIResultDecisionType.PARTIAL_ACCEPT
        ? decision.selectedPortions
        : [];
    const updatedReview = review.withChanges({
      status: nextStatus,
      decidedAt: timestamp,
      decision,
      selectedPortions,
    });

    this.#reviews.set(review.id, updatedReview);

    return updatedReview;
  }

  acceptResult(reviewId, metadata = {}) {
    return this.recordDecision(reviewId, {
      ...metadata,
      type: AIResultDecisionType.ACCEPT,
      selectedPortions: [],
    });
  }

  partiallyAcceptResult(reviewId, selectedPortions, metadata = {}) {
    return this.recordDecision(reviewId, {
      ...metadata,
      type: AIResultDecisionType.PARTIAL_ACCEPT,
      selectedPortions,
    });
  }

  requestRegeneration(reviewId, metadata = {}) {
    return this.recordDecision(reviewId, {
      ...metadata,
      type: AIResultDecisionType.REGENERATE,
      selectedPortions: [],
    });
  }

  discardResult(reviewId, metadata = {}) {
    return this.recordDecision(reviewId, {
      ...metadata,
      type: AIResultDecisionType.DISCARD,
      selectedPortions: [],
    });
  }

  prepareApplicationRequest(reviewId, definition) {
    const review = this.requireReview(reviewId);

    if (
      ![
        AIResultReviewStatus.ACCEPTED,
        AIResultReviewStatus.PARTIALLY_ACCEPTED,
      ].includes(review.status)
    ) {
      throw new Error(
        "An application request requires an explicitly approved result."
      );
    }

    const selectedPortions =
      review.status === AIResultReviewStatus.PARTIALLY_ACCEPTED
        ? review.selectedPortions
        : [];
    const request = new AIResultApplicationRequest({
      ...definition,
      reviewId: review.id,
      taskId: review.taskId,
      resultReference: review.resultReference,
      selectedPortions,
      createdAt: this.#now(),
      correlationId: review.correlationId,
    });

    this.#applicationRequests.set(review.id, request);

    return request;
  }

  getApplicationRequest(reviewId) {
    return this.#applicationRequests.get(reviewId) || null;
  }

  markApplied(reviewId, applicationRequest) {
    const review = this.requireReview(reviewId);
    const preparedRequest = this.#applicationRequests.get(review.id);

    if (
      !(applicationRequest instanceof AIResultApplicationRequest) ||
      preparedRequest !== applicationRequest
    ) {
      throw new Error(
        "Applied state requires the application request prepared for this review."
      );
    }

    assertAIResultReviewStatusTransition(
      review.status,
      AIResultReviewStatus.APPLIED
    );

    const appliedReview = review.withChanges({
      status: AIResultReviewStatus.APPLIED,
      appliedAt: this.#now(),
    });

    this.#reviews.set(review.id, appliedReview);

    return appliedReview;
  }

  #now() {
    return normalizeTimestamp(this.#clock());
  }
}
