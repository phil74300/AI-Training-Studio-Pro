import { AIProviderCapabilities } from "../../AIProviderCapabilities";
import { GEMINI_PROVIDER_ID } from "./GeminiModelDescriptor";

export class GeminiProviderDescriptor {
  constructor({ models, liveHealthCheck = false, liveExecution = false }) {
    if (!Array.isArray(models) || models.length === 0) {
      throw new TypeError(
        "GeminiProviderDescriptor requires at least one model descriptor."
      );
    }

    if (models.some((model) => model.providerId !== GEMINI_PROVIDER_ID)) {
      throw new TypeError("Gemini provider models must belong to Gemini.");
    }

    this.id = GEMINI_PROVIDER_ID;
    this.displayName = "Google Gemini";
    this.availability = Object.freeze({
      state: liveExecution ? "ready" : "unavailable",
      liveExecution,
      liveHealthCheck,
      reason: liveExecution
        ? "Live execution is available through the trusted boundary."
        : "A trusted Gemini execution service is not configured.",
    });
    this.models = Object.freeze([...models]);
    this.capabilities = new AIProviderCapabilities({
      textInput: models.some((model) => model.capabilities.textInput),
      imageInput: models.some((model) => model.capabilities.imageInput),
      textOutput: models.some((model) => model.capabilities.textOutput),
      imageOutput: models.some((model) => model.capabilities.imageOutput),
      streaming: models.some((model) => model.capabilities.streaming),
      structuredOutput: models.some(
        (model) => model.capabilities.structuredOutput
      ),
      tools: models.some((model) => model.capabilities.tools),
      reasoning: models.some((model) => model.capabilities.reasoning),
    });
    this.extensions = Object.freeze({
      gemini: Object.freeze({
        liveModelDiscovery: false,
        catalogueSource: "static-gemini-1",
      }),
    });

    Object.freeze(this);
  }
}
