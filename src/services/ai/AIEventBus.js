import { AITask } from "./AITask";
import { AITaskStatus } from "./AITaskStatus";

const cloneValue = (value) => {
  if (value instanceof AITask) {
    return value;
  }

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

const normalizeTimestamp = (value) => {
  const timestamp = requireText(value, "AI event timestamp");

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError("AI event timestamp must be a valid date-time string.");
  }

  return timestamp;
};

export const AIEventType = Object.freeze({
  TASK_CREATED: "task.created",
  TASK_QUEUED: "task.queued",
  TASK_STARTED: "task.started",
  TASK_PROGRESS: "task.progress",
  TASK_COMPLETED: "task.completed",
  TASK_FAILED: "task.failed",
  TASK_CANCELLED: "task.cancelled",
});

const lifecycleStatuses = Object.freeze({
  [AIEventType.TASK_QUEUED]: AITaskStatus.QUEUED,
  [AIEventType.TASK_STARTED]: AITaskStatus.RUNNING,
  [AIEventType.TASK_COMPLETED]: AITaskStatus.COMPLETED,
  [AIEventType.TASK_FAILED]: AITaskStatus.FAILED,
  [AIEventType.TASK_CANCELLED]: AITaskStatus.CANCELLED,
});

const normalizePayload = (type, taskId, payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError(`${type} payload must be an object.`);
  }

  if (type === AIEventType.TASK_CREATED) {
    if (!(payload.task instanceof AITask) || payload.task.id !== taskId) {
      throw new TypeError("task.created payload requires its immutable task.");
    }
  }

  if (type === AIEventType.TASK_PROGRESS) {
    if (
      !payload.progress ||
      typeof payload.progress !== "object" ||
      !Number.isFinite(payload.progress.value)
    ) {
      throw new TypeError(
        "task.progress payload requires normalized progress."
      );
    }

    if (payload.progress.value < 0 || payload.progress.value > 1) {
      throw new TypeError("task.progress payload value must be from 0 to 1.");
    }
  }

  const expectedStatus = lifecycleStatuses[type];

  if (expectedStatus && payload.status !== expectedStatus) {
    throw new TypeError(`${type} payload status must be ${expectedStatus}.`);
  }

  if (
    expectedStatus &&
    !Object.values(AITaskStatus).includes(payload.previousStatus)
  ) {
    throw new TypeError(`${type} payload requires a previous task status.`);
  }

  if (
    type === AIEventType.TASK_COMPLETED &&
    (!payload.resultReference || typeof payload.resultReference !== "object")
  ) {
    throw new TypeError("task.completed payload requires a result reference.");
  }

  if (
    type === AIEventType.TASK_FAILED &&
    (!payload.errorReference || typeof payload.errorReference !== "object")
  ) {
    throw new TypeError("task.failed payload requires an error reference.");
  }

  return cloneValue(payload);
};

export class AIEventBus {
  #listeners = new Set();

  #sequences = new Map();

  #onListenerError;

  constructor({ onListenerError = null } = {}) {
    if (onListenerError !== null && typeof onListenerError !== "function") {
      throw new TypeError("onListenerError must be a function or null.");
    }

    this.#onListenerError = onListenerError;
  }

  subscribe(listener, { taskId = null, eventTypes = [] } = {}) {
    if (typeof listener !== "function") {
      throw new TypeError("AI event listener must be a function.");
    }

    if (!Array.isArray(eventTypes)) {
      throw new TypeError("eventTypes must be an array.");
    }

    const normalizedTaskId =
      taskId === null ? null : requireText(taskId, "Subscription taskId");
    const normalizedTypes = Object.freeze(
      [...new Set(eventTypes)].map((eventType) => {
        if (!Object.values(AIEventType).includes(eventType)) {
          throw new TypeError(`Unsupported AI event type: ${eventType}`);
        }

        return eventType;
      })
    );
    const subscription = Object.freeze({
      listener,
      taskId: normalizedTaskId,
      eventTypes: normalizedTypes,
    });

    this.#listeners.add(subscription);

    return () => this.#listeners.delete(subscription);
  }

  publish({ type, taskId, timestamp, payload }) {
    if (!Object.values(AIEventType).includes(type)) {
      throw new TypeError(`Unsupported AI event type: ${type}`);
    }

    const normalizedTaskId = requireText(taskId, "AI event taskId");
    const sequence = (this.#sequences.get(normalizedTaskId) || 0) + 1;
    const event = Object.freeze({
      type,
      taskId: normalizedTaskId,
      timestamp: normalizeTimestamp(timestamp),
      sequence,
      payload: normalizePayload(type, normalizedTaskId, payload),
    });

    this.#sequences.set(normalizedTaskId, sequence);

    this.#listeners.forEach((subscription) => {
      const matchesTask =
        subscription.taskId === null || subscription.taskId === event.taskId;
      const matchesType =
        subscription.eventTypes.length === 0 ||
        subscription.eventTypes.includes(event.type);

      if (!matchesTask || !matchesType) {
        return;
      }

      try {
        subscription.listener(event);
      } catch (error) {
        this.#onListenerError?.(error, event);
      }
    });

    return event;
  }
}
