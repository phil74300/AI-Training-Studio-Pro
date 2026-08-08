import { NotificationChannel } from "./NotificationChannel";
import { NotificationDeliveryStatus } from "./NotificationStatus";

const channels = new Set(Object.values(NotificationChannel));
const statuses = new Set(Object.values(NotificationDeliveryStatus));

export class NotificationDelivery {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.notificationId ||
      !channels.has(definition?.channel)
    )
      throw new TypeError(
        "NotificationDelivery requires id, notificationId, and a supported channel."
      );
    const status = definition.status || NotificationDeliveryStatus.CREATED;
    if (!statuses.has(status))
      throw new TypeError("NotificationDelivery requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.notificationId = definition.notificationId;
    this.channel = definition.channel;
    this.status = status;
    this.timestamp = new Date(definition.timestamp || Date.now()).toISOString();
    this.providerReference = definition.providerReference || null;
    this.failureReference = definition.failureReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
