import { cloneValue } from "./UIDesignSystemValue";
import { UIStateReference } from "./UIStateReference";

export class ComponentVariant {
  constructor(definition) {
    if (!definition?.id || !definition?.componentReference)
      throw new TypeError(
        "ComponentVariant requires id and componentReference."
      );
    if (
      definition.uiStateReference &&
      !(definition.uiStateReference instanceof UIStateReference)
    )
      throw new TypeError(
        "ComponentVariant uiStateReference must be a UIStateReference instance."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.componentReference = definition.componentReference;
    this.size = definition.size || null;
    this.style = definition.style || null;
    this.uiStateReference = definition.uiStateReference || null;
    this.accessibilityReference = definition.accessibilityReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
