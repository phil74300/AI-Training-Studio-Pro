export class NotificationRecipient {
  constructor(definition) {
    if (
      !definition?.id ||
      (!definition?.userReference && !definition?.organizationReference)
    )
      throw new TypeError(
        "NotificationRecipient requires id and a user or organization reference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.userReference = definition.userReference || null;
    this.organizationReference = definition.organizationReference || null;
    this.roleReference = definition.roleReference || null;
    this.deliveryPreferenceReference =
      definition.deliveryPreferenceReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
