import {
  AITaskStatus,
  isAITaskStatus,
  isAITaskTerminalStatus,
} from "./AITaskStatus";

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

const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return cloneValue(value);
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

const normalizePromptReference = (reference) => {
  const normalized = requireRecord(reference, "promptReference");

  return Object.freeze({
    templateId: requireText(
      normalized.templateId,
      "promptReference.templateId"
    ),
    versionId: requireText(normalized.versionId, "promptReference.versionId"),
  });
};

const normalizeContextReference = (reference) => {
  const normalized = requireRecord(reference, "contextSnapshotReference");
  const schemaVersion = normalized.schemaVersion ?? 1;

  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new TypeError(
      "contextSnapshotReference.schemaVersion must be positive."
    );
  }

  return Object.freeze({
    snapshotId: requireText(
      normalized.snapshotId,
      "contextSnapshotReference.snapshotId"
    ),
    schemaVersion,
  });
};

const normalizeProgress = (progress) => {
  const normalized = requireRecord(progress, "progress");
  const value = normalized.value ?? 0;

  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new TypeError("progress.value must be a number from 0 to 1.");
  }

  return Object.freeze({
    value,
    message: optionalText(normalized.message ?? null, "progress.message"),
  });
};

const normalizeResultReference = (reference) => {
  if (reference === null) {
    return null;
  }

  const normalized = requireRecord(reference, "resultReference");
  const schemaVersion = normalized.schemaVersion ?? 1;

  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new TypeError("resultReference.schemaVersion must be positive.");
  }

  return Object.freeze({
    id: optionalText(normalized.id ?? null, "resultReference.id"),
    type: requireText(normalized.type, "resultReference.type"),
    schemaVersion,
  });
};

const normalizeErrorReference = (reference) => {
  if (reference === null) {
    return null;
  }

  const normalized = requireRecord(reference, "errorReference");

  return Object.freeze({
    code: requireText(normalized.code, "errorReference.code"),
    message: requireText(normalized.message, "errorReference.message"),
    retryable: normalized.retryable === true,
  });
};

const validateLifecycle = (task) => {
  const requiresQueuedAt = task.status !== AITaskStatus.CREATED;

  if (requiresQueuedAt && task.queuedAt === null) {
    throw new Error(`${task.status} tasks require a queuedAt timestamp.`);
  }

  if (
    [
      AITaskStatus.RUNNING,
      AITaskStatus.COMPLETED,
      AITaskStatus.FAILED,
    ].includes(task.status) &&
    task.startedAt === null
  ) {
    throw new Error(`${task.status} tasks require a startedAt timestamp.`);
  }

  if (isAITaskTerminalStatus(task.status) && task.completedAt === null) {
    throw new Error(`${task.status} tasks require a completedAt timestamp.`);
  }

  if (!isAITaskTerminalStatus(task.status) && task.completedAt !== null) {
    throw new Error("Non-terminal tasks cannot have a completedAt timestamp.");
  }

  if (task.status === AITaskStatus.COMPLETED && task.resultReference === null) {
    throw new Error("Completed tasks require a result reference.");
  }

  if (task.status !== AITaskStatus.COMPLETED && task.resultReference !== null) {
    throw new Error("Only completed tasks may contain a result reference.");
  }

  if (task.status === AITaskStatus.FAILED && task.errorReference === null) {
    throw new Error("Failed tasks require an error reference.");
  }

  if (task.status !== AITaskStatus.FAILED && task.errorReference !== null) {
    throw new Error("Only failed tasks may contain an error reference.");
  }

  const createdTime = Date.parse(task.createdAt);
  const lifecycleTimes = [
    [task.queuedAt, createdTime, "queuedAt cannot precede createdAt."],
    [
      task.startedAt,
      Date.parse(task.queuedAt || task.createdAt),
      "startedAt cannot precede queuedAt.",
    ],
    [
      task.completedAt,
      Date.parse(task.startedAt || task.queuedAt || task.createdAt),
      "completedAt cannot precede the active lifecycle timestamp.",
    ],
    [
      task.updatedAt,
      Date.parse(
        task.completedAt || task.startedAt || task.queuedAt || task.createdAt
      ),
      "updatedAt cannot precede the latest lifecycle timestamp.",
    ],
  ];

  lifecycleTimes.forEach(([timestamp, minimum, message]) => {
    if (timestamp !== null && Date.parse(timestamp) < minimum) {
      throw new Error(message);
    }
  });
};

export const AI_TASK_SCHEMA_VERSION = 1;

export class AITask {
  constructor({
    schemaVersion = AI_TASK_SCHEMA_VERSION,
    id,
    projectId = null,
    chapterId = null,
    actionId,
    promptReference,
    contextSnapshotReference,
    providerId,
    modelId,
    status = AITaskStatus.CREATED,
    createdAt,
    queuedAt = null,
    startedAt = null,
    updatedAt = createdAt,
    completedAt = null,
    progress = {},
    resultReference = null,
    errorReference = null,
    correlationId,
    retryCount = 0,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("AI task schemaVersion must be positive.");
    }

    if (!isAITaskStatus(status)) {
      throw new TypeError(`Unsupported AI task status: ${status}`);
    }

    if (!Number.isInteger(retryCount) || retryCount < 0) {
      throw new TypeError("retryCount must be a non-negative integer.");
    }

    this.schemaVersion = schemaVersion;
    this.id = requireText(id, "AI task id");
    this.projectId = optionalText(projectId, "projectId");
    this.chapterId = optionalText(chapterId, "chapterId");

    if (this.chapterId !== null && this.projectId === null) {
      throw new Error("A chapter-scoped AI task requires a projectId.");
    }

    this.actionId = requireText(actionId, "actionId");
    this.promptReference = normalizePromptReference(promptReference);
    this.contextSnapshotReference = normalizeContextReference(
      contextSnapshotReference
    );
    this.providerId = requireText(providerId, "providerId");
    this.modelId = requireText(modelId, "modelId");
    this.status = status;
    this.createdAt = normalizeTimestamp(createdAt, "createdAt", {
      required: true,
    });
    this.queuedAt = normalizeTimestamp(queuedAt, "queuedAt");
    this.startedAt = normalizeTimestamp(startedAt, "startedAt");
    this.updatedAt = normalizeTimestamp(updatedAt, "updatedAt", {
      required: true,
    });
    this.completedAt = normalizeTimestamp(completedAt, "completedAt");
    this.progress = normalizeProgress(progress);
    this.resultReference = normalizeResultReference(resultReference);
    this.errorReference = normalizeErrorReference(errorReference);
    this.correlationId = requireText(correlationId, "correlationId");
    this.retryCount = retryCount;

    validateLifecycle(this);
    Object.freeze(this);
  }

  withChanges(changes) {
    return new AITask({ ...this.toRecord(), ...changes });
  }

  toRecord() {
    return {
      schemaVersion: this.schemaVersion,
      id: this.id,
      projectId: this.projectId,
      chapterId: this.chapterId,
      actionId: this.actionId,
      promptReference: this.promptReference,
      contextSnapshotReference: this.contextSnapshotReference,
      providerId: this.providerId,
      modelId: this.modelId,
      status: this.status,
      createdAt: this.createdAt,
      queuedAt: this.queuedAt,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      progress: this.progress,
      resultReference: this.resultReference,
      errorReference: this.errorReference,
      correlationId: this.correlationId,
      retryCount: this.retryCount,
    };
  }
}

export function createAITask(definition) {
  return new AITask(definition);
}
