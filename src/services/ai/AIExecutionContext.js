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

const normalizeAbortSignal = (signal) => {
  if (signal === null) {
    return null;
  }

  if (
    typeof signal !== "object" ||
    typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function" ||
    typeof signal.removeEventListener !== "function"
  ) {
    throw new TypeError("abortSignal must implement the AbortSignal contract.");
  }

  return signal;
};

const normalizeTimeout = (timeout) => {
  if (!timeout || typeof timeout !== "object" || Array.isArray(timeout)) {
    throw new TypeError("Execution timeout must be an object.");
  }

  const timeoutMs = timeout.timeoutMs ?? null;
  const deadlineAt = timeout.deadlineAt ?? null;

  if (timeoutMs !== null && (!Number.isInteger(timeoutMs) || timeoutMs <= 0)) {
    throw new TypeError("timeout.timeoutMs must be positive or null.");
  }

  if (
    deadlineAt !== null &&
    (typeof deadlineAt !== "string" || Number.isNaN(Date.parse(deadlineAt)))
  ) {
    throw new TypeError(
      "timeout.deadlineAt must be a date-time string or null."
    );
  }

  return Object.freeze({ timeoutMs, deadlineAt });
};

export const AIExecutionMode = Object.freeze({
  STANDARD: "standard",
  STREAMING: "streaming",
});

export const AI_EXECUTION_CONTEXT_SCHEMA_VERSION = 1;

export class AIExecutionContext {
  constructor({
    schemaVersion = AI_EXECUTION_CONTEXT_SCHEMA_VERSION,
    taskId,
    correlationId,
    abortSignal = null,
    metadata = {},
    executionMode = AIExecutionMode.STANDARD,
    timeout = {},
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Execution context schemaVersion must be positive.");
    }

    if (!Object.values(AIExecutionMode).includes(executionMode)) {
      throw new TypeError(`Unsupported execution mode: ${executionMode}`);
    }

    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new TypeError("Execution context metadata must be an object.");
    }

    this.schemaVersion = schemaVersion;
    this.taskId = requireText(taskId, "Execution context taskId");
    this.correlationId = requireText(
      correlationId,
      "Execution context correlationId"
    );
    this.abortSignal = normalizeAbortSignal(abortSignal);
    this.metadata = cloneValue(metadata);
    this.executionMode = executionMode;
    this.timeout = normalizeTimeout(timeout);

    Object.freeze(this);
  }
}
