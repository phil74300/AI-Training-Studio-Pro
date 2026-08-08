import { cloneValue } from "./VisualAuthoringValue";

export class PreviewDescriptor {
  constructor(definition) {
    if (!definition?.id || !definition?.authoringDocumentReference)
      throw new TypeError(
        "PreviewDescriptor requires id and authoringDocumentReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.authoringDocumentReference = definition.authoringDocumentReference;
    this.versionReference = definition.versionReference || null;
    this.layoutReference = definition.layoutReference || null;
    this.targetReference = definition.targetReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
