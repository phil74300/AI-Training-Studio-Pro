import { AIEventBus, AIEventType } from "./AIEventBus";
import { AIExecutionContext } from "./AIExecutionContext";
import { AITask } from "./AITask";
import { AITaskRepository } from "./AITaskRepository";
import { AITaskStatus, assertAITaskStatusTransition } from "./AITaskStatus";

const repositoryMethods = Object.freeze([
  "save",
  "get",
  "require",
  "update",
  "list",
]);

const isTaskRepository = (repository) =>
  repositoryMethods.every(
    (method) => typeof repository?.[method] === "function"
  );

const isEventBus = (eventBus) =>
  typeof eventBus?.publish === "function" &&
  typeof eventBus?.subscribe === "function";

const normalizeTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("AI task clock must return a valid date or timestamp.");
  }

  return date.toISOString();
};

const optionalReason = (value) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError("Cancellation reason must be a string or null.");
  }

  return value.trim();
};

export class AITaskService {
  #repository;

  #eventBus;

  #clock;

  constructor({
    repository = new AITaskRepository(),
    eventBus = new AIEventBus(),
    clock = () => new Date(),
  } = {}) {
    if (!isTaskRepository(repository)) {
      throw new TypeError("AITaskService requires a task repository contract.");
    }

    if (!isEventBus(eventBus)) {
      throw new TypeError("AITaskService requires an AI event bus contract.");
    }

    if (typeof clock !== "function") {
      throw new TypeError("AITaskService clock must be a function.");
    }

    this.#repository = repository;
    this.#eventBus = eventBus;
    this.#clock = clock;
  }

  createTask(definition) {
    const timestamp = this.#now();
    const task = new AITask({
      ...definition,
      status: AITaskStatus.CREATED,
      createdAt: timestamp,
      queuedAt: null,
      startedAt: null,
      updatedAt: timestamp,
      completedAt: null,
      progress: { value: 0, message: null },
      resultReference: null,
      errorReference: null,
    });

    this.#repository.save(task);
    this.#eventBus.publish({
      type: AIEventType.TASK_CREATED,
      taskId: task.id,
      timestamp,
      payload: { task },
    });

    return task;
  }

  getTask(taskId) {
    return this.#repository.get(taskId);
  }

  requireTask(taskId) {
    return this.#repository.require(taskId);
  }

  listTasks(filters = {}) {
    return this.#repository.list(filters);
  }

  subscribe(listener, filters = {}) {
    return this.#eventBus.subscribe(listener, filters);
  }

  queueTask(taskId) {
    return this.#transition(
      taskId,
      AITaskStatus.QUEUED,
      AIEventType.TASK_QUEUED,
      (timestamp) => ({ queuedAt: timestamp })
    );
  }

  startTask(taskId) {
    return this.#transition(
      taskId,
      AITaskStatus.RUNNING,
      AIEventType.TASK_STARTED,
      (timestamp) => ({ startedAt: timestamp })
    );
  }

  updateProgress(taskId, progress) {
    const task = this.#repository.require(taskId);

    if (task.status !== AITaskStatus.RUNNING) {
      throw new Error("AI task progress can only change while running.");
    }

    const timestamp = this.#now();
    const updatedTask = task.withChanges({ progress, updatedAt: timestamp });

    if (updatedTask.progress.value < task.progress.value) {
      throw new Error("AI task progress cannot move backwards.");
    }

    this.#repository.update(updatedTask);
    this.#eventBus.publish({
      type: AIEventType.TASK_PROGRESS,
      taskId: updatedTask.id,
      timestamp,
      payload: { progress: updatedTask.progress },
    });

    return updatedTask;
  }

  completeTask(taskId, resultReference) {
    return this.#transition(
      taskId,
      AITaskStatus.COMPLETED,
      AIEventType.TASK_COMPLETED,
      (timestamp) => ({
        completedAt: timestamp,
        progress: { value: 1, message: null },
        resultReference,
      }),
      (task) => ({ resultReference: task.resultReference })
    );
  }

  failTask(taskId, errorReference) {
    return this.#transition(
      taskId,
      AITaskStatus.FAILED,
      AIEventType.TASK_FAILED,
      (timestamp) => ({ completedAt: timestamp, errorReference }),
      (task) => ({ errorReference: task.errorReference })
    );
  }

  cancelTask(taskId, { reason = null } = {}) {
    const normalizedReason = optionalReason(reason);

    return this.#transition(
      taskId,
      AITaskStatus.CANCELLED,
      AIEventType.TASK_CANCELLED,
      (timestamp) => ({ completedAt: timestamp }),
      () => ({ reason: normalizedReason })
    );
  }

  createExecutionContext(taskId, options = {}) {
    const task = this.#repository.require(taskId);

    if (task.status !== AITaskStatus.RUNNING) {
      throw new Error(
        "Execution context can only be created for a running AI task."
      );
    }

    return new AIExecutionContext({
      ...options,
      taskId: task.id,
      correlationId: task.correlationId,
    });
  }

  #transition(
    taskId,
    nextStatus,
    eventType,
    createChanges,
    createPayload = () => ({})
  ) {
    const task = this.#repository.require(taskId);

    assertAITaskStatusTransition(task.status, nextStatus);

    const timestamp = this.#now();
    const updatedTask = task.withChanges({
      ...createChanges(timestamp),
      status: nextStatus,
      updatedAt: timestamp,
    });

    this.#repository.update(updatedTask);
    this.#eventBus.publish({
      type: eventType,
      taskId: updatedTask.id,
      timestamp,
      payload: {
        previousStatus: task.status,
        status: updatedTask.status,
        ...createPayload(updatedTask),
      },
    });

    return updatedTask;
  }

  #now() {
    return normalizeTimestamp(this.#clock());
  }
}
