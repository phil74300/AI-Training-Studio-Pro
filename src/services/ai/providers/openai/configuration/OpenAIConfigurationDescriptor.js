import { OPENAI_PROVIDER_ID } from "../OpenAIModelDescriptor";

export const OPENAI_CONFIGURATION_DESCRIPTOR_VERSION = 1;

export class OpenAIConfigurationDescriptor {
  constructor({
    enabled = false,
    configured = false,
    defaultModel = null,
  } = {}) {
    if (typeof enabled !== "boolean" || typeof configured !== "boolean") {
      throw new TypeError("Configuration descriptor flags must be booleans.");
    }

    if (
      defaultModel !== null &&
      (typeof defaultModel !== "string" || !defaultModel.trim())
    ) {
      throw new TypeError("defaultModel must be a non-empty string or null.");
    }

    this.providerId = OPENAI_PROVIDER_ID;
    this.enabled = enabled;
    this.configured = configured;
    this.defaultModel = defaultModel?.trim() || null;
    this.descriptorVersion = OPENAI_CONFIGURATION_DESCRIPTOR_VERSION;

    Object.freeze(this);
  }

  static fromConfiguration(configuration) {
    return new OpenAIConfigurationDescriptor({
      enabled: configuration.enabled,
      configured: configuration.configured,
      defaultModel: configuration.defaultModel,
    });
  }
}
