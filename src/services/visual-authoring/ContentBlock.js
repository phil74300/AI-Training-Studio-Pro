import { ContentBlockType } from "./ContentBlockType";
import { cloneValue } from "./VisualAuthoringValue";

const blockTypes = new Set(Object.values(ContentBlockType));

export class ContentBlock {
  constructor(definition) {
    if (
      !definition?.id ||
      !blockTypes.has(definition?.type) ||
      !Number.isInteger(definition?.position) ||
      !definition?.contentReference
    )
      throw new TypeError(
        "ContentBlock requires id, a supported type, integer position, and contentReference."
      );
    if (definition.position < 0)
      throw new TypeError("ContentBlock position must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.position = definition.position;
    this.contentReference = definition.contentReference;
    this.layoutReference = definition.layoutReference || null;
    this.accessibility = cloneValue({
      alternativeTextReference:
        definition.accessibility?.alternativeTextReference || null,
      captionReference: definition.accessibility?.captionReference || null,
      transcriptReference:
        definition.accessibility?.transcriptReference || null,
      readingOrder:
        definition.accessibility?.readingOrder ?? definition.position,
      validationReference:
        definition.accessibility?.validationReference || null,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
