export const AITaskStatus = Object.freeze({
  CREATED: "CREATED",
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export const AITaskTransitions = Object.freeze({
  [AITaskStatus.CREATED]: Object.freeze([AITaskStatus.QUEUED]),
  [AITaskStatus.QUEUED]: Object.freeze([
    AITaskStatus.RUNNING,
    AITaskStatus.CANCELLED,
  ]),
  [AITaskStatus.RUNNING]: Object.freeze([
    AITaskStatus.COMPLETED,
    AITaskStatus.FAILED,
    AITaskStatus.CANCELLED,
  ]),
  [AITaskStatus.COMPLETED]: Object.freeze([]),
  [AITaskStatus.FAILED]: Object.freeze([]),
  [AITaskStatus.CANCELLED]: Object.freeze([]),
});

export const AITaskTerminalStatus = Object.freeze([
  AITaskStatus.COMPLETED,
  AITaskStatus.FAILED,
  AITaskStatus.CANCELLED,
]);

export function isAITaskStatus(value) {
  return Object.values(AITaskStatus).includes(value);
}

export function isAITaskTerminalStatus(value) {
  return AITaskTerminalStatus.includes(value);
}

export function canTransitionAITaskStatus(currentStatus, nextStatus) {
  if (!isAITaskStatus(currentStatus) || !isAITaskStatus(nextStatus)) {
    return false;
  }

  return AITaskTransitions[currentStatus].includes(nextStatus);
}

export function assertAITaskStatusTransition(currentStatus, nextStatus) {
  if (!isAITaskStatus(currentStatus)) {
    throw new TypeError(`Unsupported current AI task status: ${currentStatus}`);
  }

  if (!isAITaskStatus(nextStatus)) {
    throw new TypeError(`Unsupported next AI task status: ${nextStatus}`);
  }

  if (!canTransitionAITaskStatus(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid AI task transition: ${currentStatus} → ${nextStatus}`
    );
  }
}
