import { AIAction } from "./AIAction";
import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";
import { AIExecutionMode } from "./AIExecutionContext";

const taskServiceMethods = Object.freeze([
  "createTask",
  "getTask",
  "queueTask",
  "startTask",
  "createExecutionContext",
  "completeTask",
  "failTask",
  "cancelTask",
]);

const providerManagerMethods = Object.freeze([
  "validateAvailability",
  "listModels",
  "getCapabilities",
  "execute",
]);

const hasMethods = (value, methods) =>
  methods.every((method) => typeof value?.[method] === "function");

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return value;
};

const normalizeIds = (ids) => {
  const normalized = requireRecord(ids, "ids");

  return Object.freeze({
    taskId: requireText(normalized.taskId, "ids.taskId"),
    requestId: requireText(normalized.requestId, "ids.requestId"),
    contextSnapshotId: requireText(
      normalized.contextSnapshotId,
      "ids.contextSnapshotId"
    ),
    reviewId: requireText(normalized.reviewId, "ids.reviewId"),
    resultId: requireText(normalized.resultId, "ids.resultId"),
    correlationId: requireText(normalized.correlationId, "ids.correlationId"),
  });
};

const normalizeProvider = (provider) => {
  const normalized = requireRecord(provider, "provider");
  const config = normalized.config || {};

  requireRecord(config, "provider.config");

  return Object.freeze({
    id: requireText(normalized.id, "provider.id"),
    modelId: requireText(normalized.modelId, "provider.modelId"),
    config,
  });
};

const createOutput = ({
  task,
  renderedPrompt,
  contextSnapshot,
  request,
  response = null,
  result = null,
  review = null,
}) =>
  Object.freeze({
    task,
    renderedPrompt,
    contextSnapshot,
    request,
    response,
    result,
    review,
    applicationRequest: null,
  });

export class AIExecutionCoordinator {
  #taskService;

  #promptRenderer;

  #contextBuilder;

  #providerManager;

  #reviewService;

  constructor({
    taskService,
    promptRenderer,
    contextBuilder,
    providerManager,
    reviewService,
  }) {
    if (!hasMethods(taskService, taskServiceMethods)) {
      throw new TypeError("Coordinator requires an AITaskService contract.");
    }

    if (typeof promptRenderer?.render !== "function") {
      throw new TypeError("Coordinator requires a PromptRenderer contract.");
    }

    if (typeof contextBuilder?.build !== "function") {
      throw new TypeError("Coordinator requires an AIContextBuilder contract.");
    }

    if (!hasMethods(providerManager, providerManagerMethods)) {
      throw new TypeError(
        "Coordinator requires an AIProviderManager contract."
      );
    }

    if (
      typeof reviewService?.createReview !== "function" ||
      typeof reviewService?.getReview !== "function"
    ) {
      throw new TypeError(
        "Coordinator requires an AIResultReviewService contract."
      );
    }

    this.#taskService = taskService;
    this.#promptRenderer = promptRenderer;
    this.#contextBuilder = contextBuilder;
    this.#providerManager = providerManager;
    this.#reviewService = reviewService;
  }

  async execute({
    ids,
    actionId,
    projectId = null,
    chapterId = null,
    prompt,
    context,
    provider,
    request: requestOptions = {},
    execution: executionOptions = {},
  }) {
    if (!Object.values(AIAction).includes(actionId)) {
      throw new TypeError(`Unsupported AI action: ${actionId}`);
    }

    const normalizedIds = normalizeIds(ids);
    const normalizedPrompt = requireRecord(prompt, "prompt");
    const normalizedContext = requireRecord(context, "context");
    const normalizedProvider = normalizeProvider(provider);
    const normalizedRequest = requireRecord(requestOptions, "request");
    const normalizedExecution = requireRecord(executionOptions, "execution");

    if (!Array.isArray(normalizedContext.selectedItemIds)) {
      throw new TypeError(
        "context.selectedItemIds must explicitly declare shared context."
      );
    }

    if (this.#taskService.getTask(normalizedIds.taskId)) {
      throw new Error(`AI task already exists: ${normalizedIds.taskId}`);
    }

    if (this.#reviewService.getReview(normalizedIds.reviewId)) {
      throw new Error(
        `AI result review already exists: ${normalizedIds.reviewId}`
      );
    }

    const renderedPrompt = this.#promptRenderer.render({
      templateId: normalizedPrompt.templateId || null,
      actionId,
      versionId: normalizedPrompt.versionId || null,
      variables: normalizedPrompt.variables || {},
    });
    const availability = await this.#providerManager.validateAvailability(
      normalizedProvider.config,
      normalizedProvider.id
    );

    if (!availability.available) {
      throw new Error(`AI provider is unavailable: ${normalizedProvider.id}`);
    }

    const models = await this.#providerManager.listModels(
      normalizedProvider.config,
      normalizedProvider.id
    );
    const modelAvailable = models.some(
      (model) =>
        (typeof model === "string" ? model : model?.id) ===
        normalizedProvider.modelId
    );

    if (!modelAvailable) {
      throw new Error(`AI model is unavailable: ${normalizedProvider.modelId}`);
    }

    const capabilities = await this.#providerManager.getCapabilities(
      normalizedProvider.modelId,
      normalizedProvider.config,
      normalizedProvider.id
    );

    if (!capabilities.supports(renderedPrompt.capabilityRequirements)) {
      throw new Error("AI model does not satisfy prompt capabilities.");
    }

    const contextSnapshot = this.#contextBuilder.build({
      ...normalizedContext,
      snapshotId: normalizedIds.contextSnapshotId,
      projectId,
      chapterId,
      destination: {
        providerId: normalizedProvider.id,
        modelId: normalizedProvider.modelId,
      },
    });
    const timeout = normalizedRequest.timeout ?? null;
    const aiRequest = new AIRequest({
      requestId: normalizedIds.requestId,
      actionId,
      modelId: normalizedProvider.modelId,
      messages: renderedPrompt.messages,
      input: Object.freeze({
        value: normalizedRequest.input ?? null,
        contextSnapshot,
      }),
      multimodalInputs: normalizedRequest.multimodalInputs || [],
      generationParameters: normalizedRequest.generationParameters || {},
      outputSchema: renderedPrompt.outputSchema,
      tools: normalizedRequest.tools || [],
      timeout,
      metadata: {
        correlationId: normalizedIds.correlationId,
        projectId,
        chapterId,
        attributes: Object.freeze({
          ...(normalizedRequest.metadata?.attributes || {}),
          promptTemplateId: renderedPrompt.templateId,
          promptVersionId: renderedPrompt.versionId,
          contextSnapshotId: contextSnapshot.id,
        }),
      },
      providerExtensions: normalizedRequest.providerExtensions || {},
    });
    let task = this.#taskService.createTask({
      id: normalizedIds.taskId,
      projectId,
      chapterId,
      actionId,
      promptReference: {
        templateId: renderedPrompt.templateId,
        versionId: renderedPrompt.versionId,
      },
      contextSnapshotReference: {
        snapshotId: contextSnapshot.id,
        schemaVersion: contextSnapshot.schemaVersion,
      },
      providerId: normalizedProvider.id,
      modelId: normalizedProvider.modelId,
      correlationId: normalizedIds.correlationId,
    });

    task = this.#taskService.queueTask(task.id);

    const abortSignal = normalizedExecution.abortSignal || null;

    if (abortSignal?.aborted) {
      task = this.#taskService.cancelTask(task.id, {
        reason: "Execution cancelled before start.",
      });

      return createOutput({
        task,
        renderedPrompt,
        contextSnapshot,
        request: aiRequest,
      });
    }

    task = this.#taskService.startTask(task.id);

    const executionContext = this.#taskService.createExecutionContext(task.id, {
      abortSignal,
      executionMode: AIExecutionMode.STANDARD,
      metadata: {
        actionId,
        providerId: normalizedProvider.id,
        modelId: normalizedProvider.modelId,
        promptTemplateId: renderedPrompt.templateId,
        contextSnapshotId: contextSnapshot.id,
        ...(normalizedExecution.metadata || {}),
      },
      timeout: {
        timeoutMs: timeout,
        deadlineAt: normalizedExecution.deadlineAt || null,
      },
    });

    let response;

    try {
      response = await this.#providerManager.execute(
        aiRequest,
        executionContext,
        normalizedProvider.id
      );
    } catch {
      if (abortSignal?.aborted) {
        task = this.#taskService.cancelTask(task.id, {
          reason: "Execution cancelled while running.",
        });

        return createOutput({
          task,
          renderedPrompt,
          contextSnapshot,
          request: aiRequest,
        });
      }

      response = AIResponse.failed({
        requestId: aiRequest.requestId,
        providerId: normalizedProvider.id,
        modelId: normalizedProvider.modelId,
        error: {
          code: "execution-coordination-failed",
          message: "The coordinated AI execution failed.",
          retryable: false,
          details: {},
        },
      });
    }

    if (abortSignal?.aborted) {
      task = this.#taskService.cancelTask(task.id, {
        reason: "Execution cancelled while running.",
      });

      return createOutput({
        task,
        renderedPrompt,
        contextSnapshot,
        request: aiRequest,
        response,
      });
    }

    if (!response.success) {
      task = this.#taskService.failTask(task.id, response.error);

      return createOutput({
        task,
        renderedPrompt,
        contextSnapshot,
        request: aiRequest,
        response,
      });
    }

    const result = response.result;
    const resultReference = Object.freeze({
      id: normalizedIds.resultId,
      type: result.type,
      schemaVersion: result.schemaVersion,
    });

    task = this.#taskService.completeTask(task.id, resultReference);

    const review = this.#reviewService.createReview({
      id: normalizedIds.reviewId,
      taskId: task.id,
      resultReference,
      projectId,
      chapterId,
      correlationId: normalizedIds.correlationId,
    });

    return createOutput({
      task,
      renderedPrompt,
      contextSnapshot,
      request: aiRequest,
      response,
      result,
      review,
    });
  }
}
