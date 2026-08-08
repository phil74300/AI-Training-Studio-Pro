import { cloneValue } from "./FrontendRuntimeValue";
import { FrontendState } from "./FrontendState";

const states = new Set(Object.values(FrontendState));
const componentTypes = new Set([
  "BUTTON",
  "CARD",
  "TABLE",
  "FORM",
  "INPUT",
  "SELECT",
  "MODAL",
  "ALERT",
  "BADGE",
  "TABS",
  "MENU",
  "NAVIGATION",
  "PANEL",
]);

export class ComponentRendererReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !componentTypes.has(definition?.componentType) ||
      !definition?.designSystemReference ||
      !definition?.variantReference
    )
      throw new TypeError(
        "ComponentRendererReference requires id, a supported componentType, designSystemReference, and variantReference."
      );
    const state = definition.state || FrontendState.LOADING;
    if (!states.has(state))
      throw new TypeError(
        "ComponentRendererReference requires a supported state."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.componentType = definition.componentType;
    this.designSystemReference = definition.designSystemReference;
    this.variantReference = definition.variantReference;
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
