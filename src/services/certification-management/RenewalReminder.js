import { NotificationChannel } from "./NotificationChannel";

const validChannels = new Set(Object.values(NotificationChannel));

export class RenewalReminder {
  constructor(definition) {
    if (!definition?.id || !definition?.credentialId || !definition?.dueAt)
      throw new TypeError(
        "RenewalReminder requires id, credentialId, and dueAt."
      );
    const channels = definition.channels || [];
    if (channels.some((channel) => !validChannels.has(channel)))
      throw new TypeError(
        "RenewalReminder requires supported notification channels."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.credentialId = definition.credentialId;
    this.renewalPolicyId = definition.renewalPolicyId || null;
    this.dueAt = new Date(definition.dueAt).toISOString();
    this.channels = Object.freeze([...channels]);
    this.status = definition.status || "prepared";
    Object.freeze(this);
  }
}
