import { GeminiProviderAdapter } from "./GeminiProviderAdapter";

export const createGeminiProviderAdapter = ({
  healthCheckService = null,
  executionService = null,
} = {}) => new GeminiProviderAdapter({ healthCheckService, executionService });
