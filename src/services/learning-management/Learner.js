export class Learner {
  constructor(value) {
    if (!value?.id || !value?.nameReference)
      throw new TypeError("Learner requires id and nameReference.");
    this.schemaVersion = 1;
    this.id = value.id;
    this.nameReference = value.nameReference;
    this.contactReference = value.contactReference || null;
    this.organizationId = value.organizationId || null;
    this.status = value.status || "active";
    this.createdAt = new Date(value.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
