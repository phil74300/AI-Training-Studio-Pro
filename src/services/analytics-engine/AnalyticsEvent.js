import { AnalyticsEventType } from "./AnalyticsEventType";

const eventTypes = new Set(Object.values(AnalyticsEventType));

export class AnalyticsEvent {
  constructor(definition) {
    if (
      !definition?.id ||
      !eventTypes.has(definition?.type) ||
      !definition?.timestamp ||
      !definition?.sourceReference ||
      !definition?.entityReference ||
      !definition?.version
    )
      throw new TypeError(
        "AnalyticsEvent requires id, supported type, timestamp, sourceReference, entityReference, and version."
      );
    const timestamp = new Date(definition.timestamp);
    if (Number.isNaN(timestamp.getTime()))
      throw new TypeError("AnalyticsEvent timestamp must be valid.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.timestamp = timestamp.toISOString();
    this.sourceReference = definition.sourceReference;
    this.entityReference = definition.entityReference;
    this.version = definition.version;
    this.dimensions = Object.freeze([...(definition.dimensions || [])]);
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
