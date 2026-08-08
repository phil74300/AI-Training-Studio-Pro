import { cloneValue } from "./VisualAuthoringValue";

export class AuthoringSelection {
  constructor(definition) {
    if (!definition?.id || !definition?.authoringDocumentReference)
      throw new TypeError(
        "AuthoringSelection requires id and authoringDocumentReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.authoringDocumentReference = definition.authoringDocumentReference;
    this.selectedObjectReferences = Object.freeze([
      ...(definition.selectedObjectReferences || []),
    ]);
    this.selectionContext = cloneValue(definition.selectionContext || {});
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
