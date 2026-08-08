import { cloneValue } from "./FrontendRuntimeValue";

const viewIdentities = new Set([
  "DASHBOARD",
  "TRAINING",
  "LEARNING",
  "CERTIFICATION",
  "QUALITY",
  "ANALYTICS",
  "INTEGRATIONS",
]);

export class ViewRendererReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !viewIdentities.has(definition?.viewIdentity) ||
      !definition?.domainReference ||
      !definition?.stateReference
    )
      throw new TypeError(
        "ViewRendererReference requires id, a supported viewIdentity, domainReference, and stateReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.viewIdentity = definition.viewIdentity;
    this.domainReference = definition.domainReference;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.stateReference = definition.stateReference;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
