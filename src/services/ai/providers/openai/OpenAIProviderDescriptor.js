import { AIProviderCapabilities } from "../../AIProviderCapabilities";
import { OPENAI_PROVIDER_ID } from "./OpenAIModelDescriptor";

export class OpenAIProviderDescriptor {
  constructor({ models }) {
    if (!Array.isArray(models) || models.length === 0) {
      throw new TypeError(
        "OpenAIProviderDescriptor requires at least one model descriptor."
      );
    }

    if (models.some((model) => model.providerId !== OPENAI_PROVIDER_ID)) {
      throw new TypeError("OpenAI provider models must belong to OpenAI.");
    }

    this.id = OPENAI_PROVIDER_ID;
    this.displayName = "OpenAI";
    this.availability = Object.freeze({
      state: "unavailable",
      liveExecution: false,
      liveHealthCheck: false,
      reason: "Live OpenAI integration is not available in AI-7.1.",
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
      openai: Object.freeze({
        liveModelDiscovery: false,
        catalogueSource: "static-ai-7.1",
      }),
    });

    Object.freeze(this);
  }
}
