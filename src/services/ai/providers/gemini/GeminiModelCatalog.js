import {
  createGeminiModelCapabilities,
  GeminiCapabilityProfile,
} from "./GeminiModelCapabilities";
import { GeminiModelDescriptor } from "./GeminiModelDescriptor";

export const GEMINI_DEFAULT_MODEL_ID = "gemini-3.6-flash";

const trustedAvailability = Object.freeze({
  executable: true,
  liveDiscovery: false,
  requiresTrustedExecution: true,
});

export const GEMINI_MODEL_CATALOG = Object.freeze([
  new GeminiModelDescriptor({
    id: GEMINI_DEFAULT_MODEL_ID,
    displayName: "Gemini 3.6 Flash",
    capabilities: createGeminiModelCapabilities(GeminiCapabilityProfile.TEXT),
    availability: trustedAvailability,
    extensions: {
      gemini: Object.freeze({
        catalogueSource: "static-gemini-1",
        capabilityProfile: GeminiCapabilityProfile.TEXT,
        api: "interactions-v1",
      }),
    },
  }),
]);

export const findGeminiModel = (modelId) =>
  GEMINI_MODEL_CATALOG.find((model) => model.id === modelId) || null;
