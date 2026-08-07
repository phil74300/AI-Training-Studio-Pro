export const AITaskStatus = Object.freeze({
  CREATED: "CREATED",
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export function isAITaskStatus(value) {
  return Object.values(AITaskStatus).includes(value);
}
