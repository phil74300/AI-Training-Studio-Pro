import { NotificationChannel } from "./NotificationChannel";
import { NotificationTrigger } from "./NotificationTrigger";

const channels = new Set(Object.values(NotificationChannel));
const triggers = new Set(Object.values(NotificationTrigger));

export class NotificationRule {
  constructor(definition) {
    if (!definition?.id || !triggers.has(definition?.trigger))
      throw new TypeError(
        "NotificationRule requires id and a supported trigger."
      );
    const ruleChannels = definition.channels || [];
    if (ruleChannels.some((channel) => !channels.has(channel)))
      throw new TypeError("NotificationRule requires supported channels.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trigger = definition.trigger;
    this.audienceReferences = Object.freeze([
      ...(definition.audienceReferences || []),
    ]);
    this.delayDays = definition.delayDays ?? 0;
    this.priority = definition.priority || "medium";
    this.channels = Object.freeze([...ruleChannels]);
    this.active = definition.active !== false;
    this.validationState =
      definition.validationState || "PENDING_HUMAN_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
