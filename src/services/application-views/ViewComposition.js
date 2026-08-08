import { cloneValue } from "./ApplicationViewsValue";
import { SectionDefinition } from "./SectionDefinition";

export class ViewComposition {
  constructor(definition) {
    if (!definition?.id || !definition?.viewReference)
      throw new TypeError("ViewComposition requires id and viewReference.");
    const sections = definition.sections || [];
    if (sections.some((section) => !(section instanceof SectionDefinition)))
      throw new TypeError(
        "ViewComposition requires SectionDefinition instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.viewReference = definition.viewReference;
    this.sections = Object.freeze([...sections]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
