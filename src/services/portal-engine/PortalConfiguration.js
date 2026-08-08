import { cloneValue } from "./PortalEngineValue";

const portalTypes = new Set([
  "ADMIN_PORTAL",
  "TRAINER_PORTAL",
  "LEARNER_PORTAL",
  "CLIENT_PORTAL",
  "QUALITY_PORTAL",
]);

export class PortalConfiguration {
  constructor(definition) {
    if (!definition?.id || !portalTypes.has(definition?.portalType))
      throw new TypeError(
        "PortalConfiguration requires id and a supported portalType."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalType = definition.portalType;
    this.availableDomainReferences = Object.freeze([
      ...(definition.availableDomainReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
