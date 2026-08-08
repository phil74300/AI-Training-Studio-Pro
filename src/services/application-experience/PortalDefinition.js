import { cloneValue } from "./ApplicationExperienceValue";
import { PortalType } from "./PortalType";

const portalTypes = new Set(Object.values(PortalType));

export class PortalDefinition {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.name ||
      !portalTypes.has(definition?.portalType) ||
      !definition?.targetRoleReference ||
      !definition?.navigationReference
    )
      throw new TypeError(
        "PortalDefinition requires id, name, a supported portalType, targetRoleReference, and navigationReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description || null;
    this.portalType = definition.portalType;
    this.targetRoleReference = definition.targetRoleReference;
    this.availableDomainReferences = Object.freeze([
      ...(definition.availableDomainReferences || []),
    ]);
    this.navigationReference = definition.navigationReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
