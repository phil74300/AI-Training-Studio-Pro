import { EmbedContent } from "./EmbedContent";
import { InteractiveType } from "./InteractiveType";

const interactiveTypes = new Set(Object.values(InteractiveType));

export class InteractiveContent {
  constructor(definition) {
    if (!definition?.id || !definition?.title || !definition?.type)
      throw new TypeError("InteractiveContent requires id, title, and type.");
    if (!interactiveTypes.has(definition.type))
      throw new TypeError("InteractiveContent requires a supported type.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.type = definition.type;
    this.mediaAssetId = definition.mediaAssetId || null;
    this.embedContent = definition.embedContent
      ? definition.embedContent instanceof EmbedContent
        ? definition.embedContent
        : new EmbedContent(definition.embedContent)
      : null;
    this.sourceDocumentId = definition.sourceDocumentId || null;
    this.version = definition.version || "1.0";
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
