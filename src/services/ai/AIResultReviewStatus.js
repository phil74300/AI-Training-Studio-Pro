export const AIResultReviewStatus = Object.freeze({
  PENDING_REVIEW: "PENDING_REVIEW",
  PREVIEWED: "PREVIEWED",
  ACCEPTED: "ACCEPTED",
  PARTIALLY_ACCEPTED: "PARTIALLY_ACCEPTED",
  REGENERATE_REQUESTED: "REGENERATE_REQUESTED",
  DISCARDED: "DISCARDED",
  APPLIED: "APPLIED",
});

export const AIResultReviewTransitions = Object.freeze({
  [AIResultReviewStatus.PENDING_REVIEW]: Object.freeze([
    AIResultReviewStatus.PREVIEWED,
  ]),
  [AIResultReviewStatus.PREVIEWED]: Object.freeze([
    AIResultReviewStatus.ACCEPTED,
    AIResultReviewStatus.PARTIALLY_ACCEPTED,
    AIResultReviewStatus.REGENERATE_REQUESTED,
    AIResultReviewStatus.DISCARDED,
  ]),
  [AIResultReviewStatus.ACCEPTED]: Object.freeze([
    AIResultReviewStatus.APPLIED,
  ]),
  [AIResultReviewStatus.PARTIALLY_ACCEPTED]: Object.freeze([
    AIResultReviewStatus.APPLIED,
  ]),
  [AIResultReviewStatus.REGENERATE_REQUESTED]: Object.freeze([]),
  [AIResultReviewStatus.DISCARDED]: Object.freeze([]),
  [AIResultReviewStatus.APPLIED]: Object.freeze([]),
});

export function isAIResultReviewStatus(value) {
  return Object.values(AIResultReviewStatus).includes(value);
}

export function canTransitionAIResultReviewStatus(currentStatus, nextStatus) {
  if (
    !isAIResultReviewStatus(currentStatus) ||
    !isAIResultReviewStatus(nextStatus)
  ) {
    return false;
  }

  return AIResultReviewTransitions[currentStatus].includes(nextStatus);
}

export function assertAIResultReviewStatusTransition(
  currentStatus,
  nextStatus
) {
  if (!isAIResultReviewStatus(currentStatus)) {
    throw new TypeError(`Unsupported review status: ${currentStatus}`);
  }

  if (!isAIResultReviewStatus(nextStatus)) {
    throw new TypeError(`Unsupported next review status: ${nextStatus}`);
  }

  if (!canTransitionAIResultReviewStatus(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid AI result review transition: ${currentStatus} → ${nextStatus}`
    );
  }
}
