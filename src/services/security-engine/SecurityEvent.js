export class SecurityEvent {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.actorReference ||
      !definition?.event ||
      !definition?.timestamp ||
      !definition?.targetReference
    )
      throw new TypeError(
        "SecurityEvent requires id, actorReference, event, timestamp, and targetReference."
      );
    const timestamp = new Date(definition.timestamp);
    if (Number.isNaN(timestamp.getTime()))
      throw new TypeError("SecurityEvent requires a valid timestamp.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.actorReference = definition.actorReference;
    this.event = definition.event;
    this.timestamp = timestamp.toISOString();
    this.targetReference = definition.targetReference;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
