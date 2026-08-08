import { cloneValue } from "./ApplicationExperienceValue";

export class NavigationItem {
  constructor(definition) {
    if (!definition?.id || !definition?.label || !definition?.viewReference)
      throw new TypeError(
        "NavigationItem requires id, label, and viewReference."
      );
    if (!Number.isInteger(definition.order) || definition.order < 0)
      throw new TypeError(
        "NavigationItem requires a non-negative integer order."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.label = definition.label;
    this.viewReference = definition.viewReference;
    this.order = definition.order;
    this.permissionReferences = Object.freeze([
      ...(definition.permissionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
