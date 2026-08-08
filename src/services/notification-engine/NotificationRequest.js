import { NotificationStatus } from "./NotificationStatus";

const statuses = new Set(Object.values(NotificationStatus));

export class NotificationRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.notificationRuleId ||
      !definition?.notificationTemplateId ||
      !definition?.triggerReference ||
      !definition?.createdAt
    )
      throw new TypeError(
        "NotificationRequest requires id, notificationRuleId, notificationTemplateId, triggerReference, and createdAt."
      );
    const status = definition.status || NotificationStatus.PROPOSAL_ONLY;
    if (!statuses.has(status))
      throw new TypeError("NotificationRequest requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.notificationRuleId = definition.notificationRuleId;
    this.notificationTemplateId = definition.notificationTemplateId;
    this.triggerReference = definition.triggerReference;
    this.recipientReferences = Object.freeze([
      ...(definition.recipientReferences || []),
    ]);
    this.status = status;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
