import { AIProviderCapabilities } from "../../AIProviderCapabilities";

export const OpenAICapabilityProfile = Object.freeze({
  MULTIMODAL_TEXT: "multimodal-text",
});

const capabilityProfiles = Object.freeze({
  [OpenAICapabilityProfile.MULTIMODAL_TEXT]: Object.freeze({
    textInput: true,
    imageInput: true,
    textOutput: true,
    imageOutput: false,
    streaming: true,
    structuredOutput: true,
    tools: true,
    reasoning: false,
    contextLength: null,
    maxOutput: null,
    supportedParameters: Object.freeze(["temperature", "maxOutput", "topP"]),
  }),
});

export const createOpenAIModelCapabilities = (profileId) => {
  const profile = capabilityProfiles[profileId];

  if (!profile) {
    throw new Error(`Unknown OpenAI capability profile: ${profileId}`);
  }

  return new AIProviderCapabilities(profile);
};
