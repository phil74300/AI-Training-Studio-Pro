import { AuthenticationMethod } from "./AuthenticationMethod";

const methods = new Set(Object.values(AuthenticationMethod));

export class AuthenticationContext {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.identityReference ||
      !methods.has(definition?.method) ||
      !definition?.timestamp ||
      !definition?.trustLevel ||
      !definition?.sessionReference
    )
      throw new TypeError(
        "AuthenticationContext requires id, identityReference, a supported method, timestamp, trustLevel, and sessionReference."
      );
    const timestamp = new Date(definition.timestamp);
    if (Number.isNaN(timestamp.getTime()))
      throw new TypeError("AuthenticationContext requires a valid timestamp.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identityReference = definition.identityReference;
    this.method = definition.method;
    this.timestamp = timestamp.toISOString();
    this.trustLevel = definition.trustLevel;
    this.sessionReference = definition.sessionReference;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
