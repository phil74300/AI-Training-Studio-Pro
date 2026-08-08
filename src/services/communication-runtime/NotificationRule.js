import { cloneValue } from "./CommunicationRuntimeValue";
import { NotificationTrigger } from "./NotificationTrigger";

const triggers = new Set(Object.values(NotificationTrigger));

export class NotificationRule {
  constructor(definition) {
    if (!definition?.id || !triggers.has(definition?.trigger))
      throw new TypeError(
        "NotificationRule requires id and a supported trigger."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trigger = definition.trigger;
    this.templateReference = definition.templateReference || null;
    this.channelReferences = Object.freeze([
      ...(definition.channelReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
