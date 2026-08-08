import { ContentBlock } from "./ContentBlock";
import { cloneValue } from "./VisualAuthoringValue";

export class DocumentSection {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.authoringDocumentReference ||
      !definition?.title ||
      !Number.isInteger(definition?.order)
    )
      throw new TypeError(
        "DocumentSection requires id, authoringDocumentReference, title, and integer order."
      );
    if (definition.order < 0)
      throw new TypeError("DocumentSection order must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.authoringDocumentReference = definition.authoringDocumentReference;
    this.parentReference = definition.parentReference || null;
    this.title = definition.title;
    this.order = definition.order;
    this.blocks = Object.freeze(
      (definition.blocks || []).map((block) =>
        block instanceof ContentBlock ? block : new ContentBlock(block)
      )
    );
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
