import { cloneValue } from "./VisualAuthoringValue";

export class MediaElement {
  constructor(definition) {
    if (!definition?.id || !definition?.mediaReference)
      throw new TypeError("MediaElement requires id and mediaReference.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.mediaReference = definition.mediaReference;
    this.mediaType = definition.mediaType || null;
    this.externalEmbedReference = definition.externalEmbedReference || null;
    this.providerReference = definition.providerReference || null;
    this.accessibility = cloneValue({
      alternativeTextReference:
        definition.accessibility?.alternativeTextReference || null,
      captionReference: definition.accessibility?.captionReference || null,
      transcriptReference:
        definition.accessibility?.transcriptReference || null,
      readingOrder: definition.accessibility?.readingOrder ?? null,
      validationReference:
        definition.accessibility?.validationReference || null,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
