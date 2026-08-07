import {
  createOpenAIModelCapabilities,
  OpenAICapabilityProfile,
} from "./OpenAIModelCapabilities";
import { OpenAIModelDescriptor } from "./OpenAIModelDescriptor";

const offlineAvailability = Object.freeze({
  executable: false,
  liveDiscovery: false,
  reason: "Live OpenAI integration is not available in AI-7.1.",
});

export const OPENAI_MODEL_CATALOG = Object.freeze([
  new OpenAIModelDescriptor({
    id: "gpt-4.1",
    displayName: "GPT-4.1",
    capabilities: createOpenAIModelCapabilities(
      OpenAICapabilityProfile.MULTIMODAL_TEXT
    ),
    availability: offlineAvailability,
    extensions: {
      openai: Object.freeze({
        catalogueSource: "static-ai-7.1",
        capabilityProfile: OpenAICapabilityProfile.MULTIMODAL_TEXT,
      }),
    },
  }),
]);

export const findOpenAIModel = (modelId) =>
  OPENAI_MODEL_CATALOG.find((model) => model.id === modelId) || null;
