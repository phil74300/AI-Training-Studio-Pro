import { NotificationChannel } from "./NotificationChannel";

const validChannels = new Set(Object.values(NotificationChannel));

export class RenewalPolicy {
  constructor(definition) {
    if (!definition?.id || !definition?.validityRuleId)
      throw new TypeError("RenewalPolicy requires id and validityRuleId.");
    const channels = definition.notificationChannels || [];
    if (channels.some((channel) => !validChannels.has(channel)))
      throw new TypeError(
        "RenewalPolicy requires supported notification channels."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.validityRuleId = definition.validityRuleId;
    this.renewalLeadDays = definition.renewalLeadDays ?? 30;
    this.notificationChannels = Object.freeze([...channels]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
