import { cloneValue } from "./PortalEngineValue";
import { DomainViewReference } from "./DomainViewReference";

export class ViewContainer {
  constructor(definition) {
    if (
      !definition?.id ||
      !(definition?.domainViewReference instanceof DomainViewReference) ||
      !definition?.layoutReference
    )
      throw new TypeError(
        "ViewContainer requires id, a DomainViewReference, and layoutReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.domainViewReference = definition.domainViewReference;
    this.layoutReference = definition.layoutReference;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
