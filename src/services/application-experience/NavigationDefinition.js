import { cloneValue } from "./ApplicationExperienceValue";
import { NavigationItem } from "./NavigationItem";

export class NavigationDefinition {
  constructor(definition) {
    if (!definition?.id || !definition?.portalReference)
      throw new TypeError(
        "NavigationDefinition requires id and portalReference."
      );
    const items = definition.items || [];
    if (items.some((item) => !(item instanceof NavigationItem)))
      throw new TypeError(
        "NavigationDefinition requires NavigationItem instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.portalReference = definition.portalReference;
    this.sections = cloneValue(definition.sections || []);
    this.items = Object.freeze([...items]);
    this.permissionReferences = Object.freeze([
      ...(definition.permissionReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
