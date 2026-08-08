import { cloneValue } from "./CommunicationRuntimeValue";

export class NotificationRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.notificationRuleReference ||
      !definition?.recipientReference
    )
      throw new TypeError(
        "NotificationRequest requires id, notificationRuleReference, and recipientReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.notificationRuleReference = definition.notificationRuleReference;
    this.recipientReference = definition.recipientReference;
    this.contextReferences = Object.freeze([
      ...(definition.contextReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
