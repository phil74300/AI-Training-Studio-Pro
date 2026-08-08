export class CertificateDesign {
  constructor(definition = {}) {
    this.schemaVersion = 1;
    this.pageFormat = definition.pageFormat || "A4";
    this.orientation = definition.orientation || "landscape";
    this.dimensions = Object.freeze({ ...(definition.dimensions || {}) });
    this.elementPositions = Object.freeze({
      ...(definition.elementPositions || {}),
    });
    this.layers = Object.freeze([...(definition.layers || [])]);
    Object.freeze(this);
  }
}
