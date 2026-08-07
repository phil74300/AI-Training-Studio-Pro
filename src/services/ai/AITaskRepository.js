import { AITask } from "./AITask";
import { isAITaskStatus } from "./AITaskStatus";

const normalizeTask = (task) =>
  task instanceof AITask ? task : new AITask(task);

const optionalText = (value, field) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string or null.`);
  }

  return value.trim();
};

export class AITaskRepository {
  #tasks = new Map();

  save(task) {
    const normalizedTask = normalizeTask(task);

    if (this.#tasks.has(normalizedTask.id)) {
      throw new Error(`AI task already exists: ${normalizedTask.id}`);
    }

    this.#tasks.set(normalizedTask.id, normalizedTask);

    return normalizedTask;
  }

  get(taskId) {
    return this.#tasks.get(taskId) || null;
  }

  require(taskId) {
    const task = this.get(taskId);

    if (!task) {
      throw new Error(`Unknown AI task: ${taskId}`);
    }

    return task;
  }

  update(task) {
    const normalizedTask = normalizeTask(task);

    if (!this.#tasks.has(normalizedTask.id)) {
      throw new Error(`Cannot update unknown AI task: ${normalizedTask.id}`);
    }

    this.#tasks.set(normalizedTask.id, normalizedTask);

    return normalizedTask;
  }

  list({ projectId = null, chapterId = null, status = null } = {}) {
    const normalizedProjectId = optionalText(projectId, "projectId");
    const normalizedChapterId = optionalText(chapterId, "chapterId");

    if (status !== null && !isAITaskStatus(status)) {
      throw new TypeError(`Unsupported AI task status filter: ${status}`);
    }

    return Object.freeze(
      [...this.#tasks.values()]
        .filter(
          (task) =>
            normalizedProjectId === null ||
            task.projectId === normalizedProjectId
        )
        .filter(
          (task) =>
            normalizedChapterId === null ||
            task.chapterId === normalizedChapterId
        )
        .filter((task) => status === null || task.status === status)
        .sort(
          (left, right) =>
            Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
            left.id.localeCompare(right.id)
        )
    );
  }
}
