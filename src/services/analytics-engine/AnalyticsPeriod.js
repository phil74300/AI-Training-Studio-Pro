export class AnalyticsPeriod {
  constructor(definition) {
    if (!definition?.id || !definition?.startsAt || !definition?.endsAt)
      throw new TypeError("AnalyticsPeriod requires id, startsAt, and endsAt.");
    const startsAt = new Date(definition.startsAt);
    const endsAt = new Date(definition.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
      throw new TypeError("AnalyticsPeriod dates must be valid.");
    if (endsAt < startsAt)
      throw new TypeError("AnalyticsPeriod endsAt cannot precede startsAt.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.startsAt = startsAt.toISOString();
    this.endsAt = endsAt.toISOString();
    this.label = definition.label || null;
    Object.freeze(this);
  }
}
