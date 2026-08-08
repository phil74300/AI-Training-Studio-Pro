import { cloneValue } from "./ApplicationViewsValue";
import { ViewState } from "./ViewState";

const states = new Set(Object.values(ViewState));

export class ComponentReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.componentIdentity ||
      !definition?.variantReference
    )
      throw new TypeError(
        "ComponentReference requires id, componentIdentity, and variantReference."
      );
    const state = definition.state || ViewState.LOADING;
    if (!states.has(state))
      throw new TypeError("ComponentReference requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.componentIdentity = definition.componentIdentity;
    this.variantReference = definition.variantReference;
    this.state = state;
    this.accessibilityReference = definition.accessibilityReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
