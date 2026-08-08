import { NotificationChannel } from "./NotificationChannel";

const channels = new Set(Object.values(NotificationChannel));

export class NotificationPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.userReference)
      throw new TypeError(
        "NotificationPreference requires id and userReference."
      );
    const allowedChannels = definition.allowedChannels || [];
    if (allowedChannels.some((channel) => !channels.has(channel)))
      throw new TypeError(
        "NotificationPreference requires supported channels."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userReference = definition.userReference;
    this.preferredLanguage = definition.preferredLanguage || null;
    this.allowedChannels = Object.freeze([...allowedChannels]);
    this.optInReferences = Object.freeze([
      ...(definition.optInReferences || []),
    ]);
    this.reminderPreferences = Object.freeze({
      ...(definition.reminderPreferences || {}),
    });
    this.updatedAt = new Date(definition.updatedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
