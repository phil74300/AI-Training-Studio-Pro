import { AIProviderCapabilities } from "../../AIProviderCapabilities";

export const GeminiCapabilityProfile = Object.freeze({
  TEXT: "text",
});

const capabilityProfiles = Object.freeze({
  [GeminiCapabilityProfile.TEXT]: Object.freeze({
    textInput: true,
    imageInput: false,
    textOutput: true,
    imageOutput: false,
    streaming: false,
    structuredOutput: false,
    tools: false,
    reasoning: true,
    contextLength: null,
    maxOutput: null,
    supportedParameters: Object.freeze(["maxOutput"]),
  }),
});

export const createGeminiModelCapabilities = (profileId) => {
  const profile = capabilityProfiles[profileId];

  if (!profile) {
    throw new Error(`Unknown Gemini capability profile: ${profileId}`);
  }

  return new AIProviderCapabilities(profile);
};
