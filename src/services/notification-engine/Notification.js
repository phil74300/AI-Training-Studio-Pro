import { NotificationStatus } from "./NotificationStatus";

const statuses = new Set(Object.values(NotificationStatus));

export class Notification {
  constructor(definition) {
    if (!definition?.id || !definition?.notificationRequestId)
      throw new TypeError(
        "Notification requires id and notificationRequestId."
      );
    const status = definition.status || NotificationStatus.PROPOSAL_ONLY;
    if (!statuses.has(status))
      throw new TypeError("Notification requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.notificationRequestId = definition.notificationRequestId;
    this.status = status;
    this.priority = definition.priority || "medium";
    this.aiSuggestion = Object.freeze({
      timingReference: definition.aiSuggestion?.timingReference || null,
      communicationImprovementReference:
        definition.aiSuggestion?.communicationImprovementReference || null,
      priorityReference: definition.aiSuggestion?.priorityReference || null,
      confidence: definition.aiSuggestion?.confidence ?? null,
    });
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
