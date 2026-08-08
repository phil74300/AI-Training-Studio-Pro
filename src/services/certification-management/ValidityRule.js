import { ExpirationStatus } from "./ExpirationStatus";

const validDate = (value, name) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new TypeError(`${name} must be a date.`);
  return date;
};

export class ValidityRule {
  constructor(definition) {
    if (!definition?.id || !Number.isInteger(definition.durationMonths))
      throw new TypeError("ValidityRule requires id and durationMonths.");
    if (definition.durationMonths < 1)
      throw new TypeError("ValidityRule durationMonths must be positive.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.durationMonths = definition.durationMonths;
    this.renewalIntervalMonths =
      definition.renewalIntervalMonths ?? definition.durationMonths;
    this.expirationPolicy =
      definition.expirationPolicy || "expires-at-end-of-day";
    this.expiringSoonDays = definition.expiringSoonDays ?? 30;
    Object.freeze(this);
  }

  expiresAt(issueDate) {
    const date = validDate(issueDate, "issueDate");
    date.setMonth(date.getMonth() + this.durationMonths);
    return date.toISOString();
  }

  expirationStatus(expiresAt, now = new Date()) {
    const expiry = validDate(expiresAt, "expiresAt");
    const reference = validDate(now, "now");
    if (expiry <= reference) return ExpirationStatus.EXPIRED;
    const threshold = new Date(reference);
    threshold.setDate(threshold.getDate() + this.expiringSoonDays);
    return expiry <= threshold
      ? ExpirationStatus.EXPIRING_SOON
      : ExpirationStatus.ACTIVE;
  }
}
