import { cloneValue } from "./DashboardExperienceValue";
import { DashboardSection } from "./DashboardSection";
const identities = new Set([
  "ADMIN_DASHBOARD",
  "TRAINER_DASHBOARD",
  "LEARNER_DASHBOARD",
  "CLIENT_DASHBOARD",
  "QUALITY_DASHBOARD",
]);
export class DashboardDefinitionInstance {
  constructor(definition) {
    if (
      !definition?.id ||
      !identities.has(definition?.identity) ||
      !definition?.portalReference
    )
      throw new TypeError(
        "DashboardDefinitionInstance requires id, a supported identity, and portalReference."
      );
    const sections = definition.sections || [];
    if (sections.some((section) => !(section instanceof DashboardSection)))
      throw new TypeError(
        "DashboardDefinitionInstance requires DashboardSection instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identity = definition.identity;
    this.portalReference = definition.portalReference;
    this.sections = Object.freeze([...sections]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
