import { DeliveryFormat } from "./DeliveryFormat";

const formats = new Set(Object.values(DeliveryFormat));

export class DeliveryCapability {
  constructor(definition) {
    if (!definition?.id || !formats.has(definition?.format))
      throw new TypeError(
        "DeliveryCapability requires id and a supported delivery format."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.format = definition.format;
    this.capabilities = Object.freeze([...(definition.capabilities || [])]);
    this.compatibility = Object.freeze({ ...(definition.compatibility || {}) });
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }

  validatePackage(trainingPackage) {
    const errors = [];
    if (!trainingPackage?.id) errors.push("missing-package-id");
    if (!trainingPackage?.metadata?.version)
      errors.push("missing-package-version");
    if (!trainingPackage?.manifest?.sourceDocumentId)
      errors.push("missing-source-document");
    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }
}
