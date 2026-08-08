export class ContentBlock {
  constructor(definition) {
    if (!definition?.id || !Number.isInteger(definition?.order))
      throw new TypeError("ContentBlock requires id and integer order.");
    if (definition.order < 0)
      throw new TypeError("ContentBlock order must be zero or greater.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.textReference = definition.textReference || null;
    this.mediaReference = definition.mediaReference || null;
    this.interactiveReference = definition.interactiveReference || null;
    this.order = definition.order;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
