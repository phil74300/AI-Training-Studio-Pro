export class UserPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.userId)
      throw new TypeError("UserPreference requires id and userId.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userId = definition.userId;
    this.language = definition.language || null;
    this.notificationPreferences = Object.freeze({
      ...(definition.notificationPreferences || {}),
    });
    this.displayPreferences = Object.freeze({
      ...(definition.displayPreferences || {}),
    });
    this.consentReferences = Object.freeze([
      ...(definition.consentReferences || []),
    ]);
    this.updatedAt = new Date(definition.updatedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
