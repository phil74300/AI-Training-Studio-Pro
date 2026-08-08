import { cloneValue } from "./CommunicationRuntimeValue";

export class CommunicationAuditReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.communicationMessageReference ||
      !definition?.auditReference
    )
      throw new TypeError(
        "CommunicationAuditReference requires id, communicationMessageReference, and auditReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.communicationMessageReference =
      definition.communicationMessageReference;
    this.auditReference = definition.auditReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
