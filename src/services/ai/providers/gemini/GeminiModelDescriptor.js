import { AIProviderCapabilities } from "../../AIProviderCapabilities";

export const GEMINI_PROVIDER_ID = "gemini";

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

export class GeminiModelDescriptor {
  constructor({
    id,
    displayName,
    capabilities,
    status = "catalogued",
    availability = {},
    extensions = {},
  }) {
    this.id = requireText(id, "Gemini model id");
    this.displayName = requireText(displayName, "Gemini model displayName");
    this.providerId = GEMINI_PROVIDER_ID;
    this.capabilities = AIProviderCapabilities.from(capabilities);
    this.contextLength = this.capabilities.contextLength;
    this.maxOutput = this.capabilities.maxOutput;
    this.status = requireText(status, "Gemini model status");
    this.availability = cloneRecord(availability, "Gemini model availability");
    this.extensions = cloneRecord(extensions, "Gemini model extensions");

    Object.freeze(this);
  }
}
