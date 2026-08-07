import { AIProviderCapabilities } from "../../AIProviderCapabilities";

export const OPENAI_PROVIDER_ID = "openai";

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const cloneRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return Object.freeze({ ...value });
};

export class OpenAIModelDescriptor {
  constructor({
    id,
    displayName,
    capabilities,
    status = "catalogued",
    availability = {},
    extensions = {},
  }) {
    this.id = requireText(id, "OpenAI model id");
    this.displayName = requireText(displayName, "OpenAI model displayName");
    this.providerId = OPENAI_PROVIDER_ID;
    this.capabilities = AIProviderCapabilities.from(capabilities);
    this.contextLength = this.capabilities.contextLength;
    this.maxOutput = this.capabilities.maxOutput;
    this.status = requireText(status, "OpenAI model status");
    this.availability = cloneRecord(availability, "OpenAI model availability");
    this.extensions = cloneRecord(extensions, "OpenAI model extensions");

    Object.freeze(this);
  }
}
