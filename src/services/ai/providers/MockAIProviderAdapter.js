import { AIProviderAdapter } from "../AIProviderAdapter";
import { AIProviderCapabilities } from "../AIProviderCapabilities";
import { AIRequest } from "../AIRequest";
import { AIResponse } from "../AIResponse";
import { AIResult, AIResultType } from "../AIResult";

export const MOCK_AI_PROVIDER_ID = "mock";
export const MOCK_AI_MODEL_ID = "mock-text-1";

const MockExecutionMode = Object.freeze({
  SUCCESS: "success",
  FAILURE: "failure",
});

const modelDescriptor = Object.freeze({
  id: MOCK_AI_MODEL_ID,
  name: "Deterministic Mock Model",
});

const capabilities = new AIProviderCapabilities({
  textInput: true,
  imageInput: true,
  textOutput: true,
  imageOutput: true,
  structuredOutput: true,
  tools: false,
  reasoning: false,
  streaming: false,
  contextLength: 32_000,
  maxOutput: 4_000,
  supportedParameters: ["temperature", "maxOutput"],
});

const resultTypeByPromptType = Object.freeze({
  text: AIResultType.TEXT,
  lesson: AIResultType.STRUCTURED_DATA,
  quiz: AIResultType.QUIZ,
  image: AIResultType.IMAGE_ARTIFACT,
  artifact: AIResultType.FILE_ARTIFACT,
  "editor-suggestion": AIResultType.EDITOR_SUGGESTION,
});

const createPayload = (resultType, actionId) => {
  switch (resultType) {
    case AIResultType.STRUCTURED_DATA:
      return Object.freeze({
        kind: "lesson",
        title: "Deterministic mock lesson",
        sections: Object.freeze([]),
      });
    case AIResultType.QUIZ:
      return Object.freeze({
        title: "Deterministic mock quiz",
        questions: Object.freeze([]),
      });
    case AIResultType.IMAGE_ARTIFACT:
      return Object.freeze({
        artifactId: "mock-image-artifact",
        mediaType: "image/png",
      });
    case AIResultType.FILE_ARTIFACT:
      return Object.freeze({
        artifactId: "mock-file-artifact",
        mediaType: "application/octet-stream",
      });
    case AIResultType.EDITOR_SUGGESTION:
      return Object.freeze({
        operation: "replace-selection",
        content: "Deterministic mock suggestion.",
      });
    default:
      return `Deterministic mock response for ${actionId}.`;
  }
};

const createCancellationError = () => {
  const error = new Error("Mock execution was cancelled.");

  error.code = "execution-cancelled";

  return error;
};

export class MockAIProviderAdapter extends AIProviderAdapter {
  constructor() {
    super(MOCK_AI_PROVIDER_ID);
  }

  validateConfiguration(config = {}) {
    const valid = Boolean(
      config && typeof config === "object" && !Array.isArray(config)
    );

    return Object.freeze({
      valid,
      errors: Object.freeze(valid ? [] : ["Configuration must be an object."]),
    });
  }

  listModels() {
    return Object.freeze([modelDescriptor]);
  }

  getCapabilities(modelId) {
    if (modelId !== MOCK_AI_MODEL_ID) {
      throw new Error(`Unknown mock model: ${modelId}`);
    }

    return capabilities;
  }

  async execute(request, executionContext) {
    if (!(request instanceof AIRequest)) {
      throw new TypeError("Mock provider requires an AIRequest.");
    }

    if (request.modelId !== MOCK_AI_MODEL_ID) {
      throw new Error(`Unknown mock model: ${request.modelId}`);
    }

    const mode =
      request.providerExtensions[this.id]?.mode || MockExecutionMode.SUCCESS;

    if (!Object.values(MockExecutionMode).includes(mode)) {
      throw new Error(`Unsupported mock execution mode: ${mode}`);
    }

    await Promise.resolve();

    if (executionContext?.abortSignal?.aborted) {
      throw createCancellationError();
    }

    if (mode === MockExecutionMode.FAILURE) {
      return AIResponse.failed({
        requestId: request.requestId,
        providerId: this.id,
        modelId: request.modelId,
        error: {
          code: "mock-execution-failed",
          message: "Deterministic mock failure.",
          retryable: false,
          details: {},
        },
        providerMetadata: { mock: { deterministic: true, mode } },
      });
    }

    const promptResultType =
      request.outputSchema?.expectedResultType || AIResultType.TEXT;
    const resultType =
      resultTypeByPromptType[promptResultType] || AIResultType.TEXT;
    const result = new AIResult({
      type: resultType,
      schemaVersion: 1,
      payload: createPayload(resultType, request.actionId),
      metadata: {
        deterministic: true,
        providerId: this.id,
        modelId: request.modelId,
      },
    });
    const inputUnits = request.messages.length;

    return AIResponse.completed({
      requestId: request.requestId,
      providerId: this.id,
      modelId: request.modelId,
      result,
      usage: {
        inputUnits,
        outputUnits: 1,
        totalUnits: inputUnits + 1,
      },
      finishReason: "completed",
      providerMetadata: { mock: { deterministic: true, mode } },
    });
  }

  healthCheck() {
    return Object.freeze({ available: true, providerId: this.id });
  }
}
