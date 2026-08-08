import { AIRequest } from "../../../../services/ai/AIRequest";
import { AIResponse } from "../../../../services/ai/AIResponse";
import { AIResult, AIResultType } from "../../../../services/ai/AIResult";
import { GEMINI_PROVIDER_ID } from "../../../../services/ai/providers/gemini/GeminiModelDescriptor";
import { GeminiConfiguration } from "../../../../services/ai/providers/gemini/configuration/GeminiConfiguration";
import { GEMINI_API_BASE_URL } from "./GeminiHealthCheckService";

const errorCategories = Object.freeze({
  AUTHENTICATION: "authentication",
  QUOTA: "quota",
  TIMEOUT: "timeout",
  NETWORK: "network",
  PROVIDER: "provider",
  UNKNOWN: "unknown",
});

const requireCredentialStore = (credentialStore) => {
  if (
    typeof credentialStore?.exists !== "function" ||
    typeof credentialStore?.getSecret !== "function"
  ) {
    throw new TypeError(
      "GeminiExecutionService requires a trusted credential store."
    );
  }

  return credentialStore;
};

const requireConfiguration = (configuration) => {
  if (!(configuration instanceof GeminiConfiguration)) {
    throw new TypeError(
      "GeminiExecutionService requires a GeminiConfiguration."
    );
  }

  if (!configuration.enabled || !configuration.configured) {
    throw new TypeError(
      "GeminiExecutionService requires an enabled, configured provider."
    );
  }

  return configuration;
};

const createError = (category, code, message, retryable = false) => ({
  code,
  category,
  message,
  retryable,
  details: { category },
});

const failedResponse = (request, error, networkRequestPerformed = false) =>
  AIResponse.failed({
    requestId: request.requestId,
    providerId: GEMINI_PROVIDER_ID,
    modelId: request.modelId,
    error,
    providerMetadata: {
      gemini: Object.freeze({ networkRequestPerformed }),
    },
  });

const normalizeMessages = (request) => {
  const systemParts = [];
  const contents = [];

  request.messages.forEach((message, index) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      throw new TypeError(`messages[${index}] must be an object.`);
    }

    if (typeof message.content !== "string" || !message.content.trim()) {
      throw new TypeError(
        `messages[${index}].content must be a non-empty string.`
      );
    }

    if (message.role === "system" || message.role === "developer") {
      systemParts.push(Object.freeze({ text: message.content }));
      return;
    }

    const role = message.role === "assistant" ? "model" : message.role;

    if (role !== "user" && role !== "model") {
      throw new TypeError(`Unsupported message role: ${message.role}`);
    }

    contents.push(
      Object.freeze({
        role,
        parts: Object.freeze([Object.freeze({ text: message.content })]),
      })
    );
  });

  if (request.input?.value !== null && request.input?.value !== undefined) {
    if (
      typeof request.input.value !== "string" ||
      !request.input.value.trim()
    ) {
      throw new TypeError("Gemini text input must be a non-empty string.");
    }

    contents.push(
      Object.freeze({
        role: "user",
        parts: Object.freeze([
          Object.freeze({ text: request.input.value.trim() }),
        ]),
      })
    );
  }

  if (contents.length === 0 || contents.at(-1).role === "model") {
    throw new TypeError(
      "Gemini execution requires a final user message or text input."
    );
  }

  return Object.freeze({
    systemInstruction:
      systemParts.length > 0
        ? Object.freeze({ parts: Object.freeze(systemParts) })
        : null,
    contents: Object.freeze(contents),
  });
};

const normalizeGenerationConfig = (parameters) => {
  const unknown = Object.keys(parameters).filter(
    (parameter) => parameter !== "maxOutput"
  );

  if (unknown.length > 0) {
    throw new TypeError(
      `Unsupported Gemini generation parameters: ${unknown.join(", ")}`
    );
  }

  if (parameters.maxOutput === undefined) {
    return null;
  }

  if (!Number.isInteger(parameters.maxOutput) || parameters.maxOutput <= 0) {
    throw new TypeError("generationParameters.maxOutput must be positive.");
  }

  return Object.freeze({ maxOutputTokens: parameters.maxOutput });
};

const buildRequestBody = (request) => {
  if (request.multimodalInputs.length > 0) {
    throw new TypeError("Gemini multimodal input is outside GEMINI-1 scope.");
  }

  if (request.tools.length > 0) {
    throw new TypeError("Gemini tools are outside GEMINI-1 scope.");
  }

  if (
    request.outputSchema?.expectedResultType &&
    request.outputSchema.expectedResultType !== "text"
  ) {
    throw new TypeError("GEMINI-1 supports text output only.");
  }

  const contextSnapshot = request.input?.contextSnapshot;

  if (contextSnapshot?.items?.length > 0) {
    throw new TypeError(
      "Gemini context serialization is not available in GEMINI-1."
    );
  }

  const { systemInstruction, contents } = normalizeMessages(request);
  const generationConfig = normalizeGenerationConfig(
    request.generationParameters
  );
  const body = { contents, store: false };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  if (generationConfig) {
    body.generationConfig = generationConfig;
  }

  return Object.freeze(body);
};

const parseUsage = (usage = {}) => ({
  inputUnits: usage.promptTokenCount ?? null,
  outputUnits: usage.candidatesTokenCount ?? null,
  totalUnits: usage.totalTokenCount ?? null,
  cachedInputUnits: usage.cachedContentTokenCount ?? null,
  reasoningUnits: usage.thoughtsTokenCount ?? null,
});

const extractText = (payload) => {
  const candidate = Array.isArray(payload?.candidates)
    ? payload.candidates[0]
    : null;
  const parts = candidate?.content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .filter((part) => typeof part?.text === "string")
    .map((part) => part.text)
    .join("");

  return text || null;
};

const errorFromStatus = (status) => {
  if (status === 401 || status === 403) {
    return createError(
      errorCategories.AUTHENTICATION,
      status === 401 ? "gemini-unauthorized" : "gemini-forbidden",
      "The Gemini credential was not authorized."
    );
  }

  if (status === 429) {
    return createError(
      errorCategories.QUOTA,
      "gemini-quota-exceeded",
      "Gemini quota is unavailable for this request.",
      true
    );
  }

  if (status === 408 || status === 504) {
    return createError(
      errorCategories.TIMEOUT,
      "gemini-execution-timeout",
      "The Gemini request timed out.",
      true
    );
  }

  return createError(
    errorCategories.PROVIDER,
    "gemini-provider-error",
    "Gemini could not complete the request.",
    status >= 500
  );
};

export class GeminiExecutionService {
  #credentialStore;

  #configuration;

  #request;

  constructor({ credentialStore, configuration, request = globalThis.fetch }) {
    this.#credentialStore = requireCredentialStore(credentialStore);
    this.#configuration = requireConfiguration(configuration);

    if (typeof request !== "function") {
      throw new TypeError(
        "GeminiExecutionService requires an HTTP request function."
      );
    }

    this.#request = request;
  }

  async execute(request, executionContext) {
    if (!(request instanceof AIRequest)) {
      throw new TypeError("Gemini execution requires an AIRequest.");
    }

    if (request.modelId !== this.#configuration.defaultModel) {
      return failedResponse(
        request,
        createError(
          errorCategories.PROVIDER,
          "gemini-model-mismatch",
          "The requested Gemini model is not configured."
        )
      );
    }

    let body;

    try {
      body = buildRequestBody(request);
    } catch {
      return failedResponse(
        request,
        createError(
          errorCategories.PROVIDER,
          "gemini-unsupported-request",
          "The request uses features unsupported by GEMINI-1."
        )
      );
    }

    const credentialId = this.#configuration.credentialReference.credentialId;
    let secret;

    try {
      const exists = await this.#credentialStore.exists(
        GEMINI_PROVIDER_ID,
        credentialId
      );

      if (!exists) {
        return failedResponse(
          request,
          createError(
            errorCategories.AUTHENTICATION,
            "gemini-missing-credential",
            "The configured Gemini credential is unavailable."
          )
        );
      }

      secret = await this.#credentialStore.getSecret(
        GEMINI_PROVIDER_ID,
        credentialId
      );
    } catch {
      return failedResponse(
        request,
        createError(
          errorCategories.AUTHENTICATION,
          "gemini-credential-unavailable",
          "The configured Gemini credential could not be accessed."
        )
      );
    }

    const controller = new AbortController();
    const externalSignal = executionContext?.abortSignal || null;
    const abortFromCaller = () => controller.abort();
    let timedOut = false;
    const timeoutMs = Math.min(
      request.timeout || this.#configuration.timeoutMs,
      this.#configuration.timeoutMs
    );
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

    if (externalSignal?.aborted) {
      controller.abort();
    }

    try {
      const endpoint = `${GEMINI_API_BASE_URL}/models/${encodeURIComponent(
        request.modelId
      )}:generateContent`;
      const response = await this.#request(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": secret,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response?.ok) {
        return failedResponse(
          request,
          errorFromStatus(
            Number.isInteger(response?.status) ? response.status : 0
          ),
          true
        );
      }

      let payload;

      try {
        payload = await response.json();
      } catch {
        return failedResponse(
          request,
          createError(
            errorCategories.PROVIDER,
            "gemini-invalid-response",
            "Gemini returned an invalid response."
          ),
          true
        );
      }

      const text = extractText(payload);

      if (!text) {
        return failedResponse(
          request,
          createError(
            errorCategories.PROVIDER,
            "gemini-empty-response",
            "Gemini returned no text result."
          ),
          true
        );
      }

      return AIResponse.completed({
        requestId: request.requestId,
        providerId: GEMINI_PROVIDER_ID,
        modelId: request.modelId,
        result: new AIResult({
          type: AIResultType.TEXT,
          schemaVersion: 1,
          payload: text,
          metadata: {
            providerId: GEMINI_PROVIDER_ID,
            modelId: request.modelId,
            generatedForReview: true,
          },
        }),
        usage: parseUsage(payload.usageMetadata),
        finishReason: payload.candidates?.[0]?.finishReason || null,
        providerMetadata: {
          gemini: Object.freeze({
            responseId:
              typeof payload.responseId === "string"
                ? payload.responseId
                : null,
            modelVersion:
              typeof payload.modelVersion === "string"
                ? payload.modelVersion
                : null,
            networkRequestPerformed: true,
          }),
        },
      });
    } catch (error) {
      if (externalSignal?.aborted) {
        throw error;
      }

      if (timedOut || error?.name === "AbortError") {
        return failedResponse(
          request,
          createError(
            errorCategories.TIMEOUT,
            "gemini-execution-timeout",
            "The Gemini request timed out.",
            true
          ),
          true
        );
      }

      return failedResponse(
        request,
        createError(
          errorCategories.NETWORK,
          "gemini-unreachable",
          "Gemini could not be reached.",
          true
        ),
        true
      );
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromCaller);
    }
  }
}
