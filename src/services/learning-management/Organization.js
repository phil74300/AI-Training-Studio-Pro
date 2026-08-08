export class Organization {
  constructor(value) {
    if (!value?.id || !value?.nameReference)
      throw new TypeError("Organization requires id and nameReference.");
    this.schemaVersion = 1;
    this.id = value.id;
    this.nameReference = value.nameReference;
    this.status = value.status || "active";
    this.createdAt = new Date(value.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
