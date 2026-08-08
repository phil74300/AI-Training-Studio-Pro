import { AIContextBuilder } from "../../../../services/ai/context/AIContextBuilder";
import { AIExecutionCoordinator } from "../../../../services/ai/AIExecutionCoordinator";
import { AIResultReviewService } from "../../../../services/ai/AIResultReviewService";
import { AITaskService } from "../../../../services/ai/AITaskService";
import { createDefaultPromptRegistry } from "../../../../services/ai/prompts/PromptDefinitions";
import { PromptRenderer } from "../../../../services/ai/prompts/PromptRenderer";
import { GeminiConfigurationValidator } from "../../../../services/ai/providers/gemini/configuration/GeminiConfigurationValidator";
import { createTrustedGeminiProviderManager } from "./createTrustedGeminiProviderManager";

export const createTrustedGeminiExecutionCoordinator = ({
  credentialStore,
  configuration,
  promptRegistry = createDefaultPromptRegistry(),
  request = globalThis.fetch,
  clock = () => new Date(),
}) => {
  const validation = new GeminiConfigurationValidator().validate(configuration);

  if (!validation.valid) {
    throw new TypeError("A valid Gemini configuration is required.");
  }

  const providerManager = createTrustedGeminiProviderManager({
    credentialStore,
    configuration: validation.configuration,
    request,
    clock,
  });

  return new AIExecutionCoordinator({
    taskService: new AITaskService({ clock }),
    promptRenderer: new PromptRenderer(promptRegistry),
    contextBuilder: new AIContextBuilder(),
    providerManager,
    reviewService: new AIResultReviewService({ clock }),
  });
};
