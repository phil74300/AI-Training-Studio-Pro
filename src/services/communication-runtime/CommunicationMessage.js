import { cloneValue } from "./CommunicationRuntimeValue";

export class CommunicationMessage {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.notificationRequestReference ||
      !definition?.messageTemplateReference
    )
      throw new TypeError(
        "CommunicationMessage requires id, notificationRequestReference, and messageTemplateReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.notificationRequestReference = definition.notificationRequestReference;
    this.messageTemplateReference = definition.messageTemplateReference;
    this.variableReferences = Object.freeze([
      ...(definition.variableReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
