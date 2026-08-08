import { cloneValue } from "./ApplicationViewsValue";
import { SectionDefinition } from "./SectionDefinition";

const identities = new Set([
  "DASHBOARD_VIEW",
  "TRAINING_VIEW",
  "LEARNING_VIEW",
  "CERTIFICATION_VIEW",
  "QUALITY_VIEW",
  "ANALYTICS_VIEW",
  "INTEGRATION_VIEW",
]);

export class ApplicationView {
  constructor(definition) {
    if (
      !definition?.id ||
      !identities.has(definition?.identity) ||
      !definition?.title ||
      !definition?.portalReference ||
      !definition?.layoutReference
    )
      throw new TypeError(
        "ApplicationView requires id, a supported identity, title, portalReference, and layoutReference."
      );
    const sections = definition.sections || [];
    if (sections.some((section) => !(section instanceof SectionDefinition)))
      throw new TypeError(
        "ApplicationView requires SectionDefinition instances."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identity = definition.identity;
    this.title = definition.title;
    this.portalReference = definition.portalReference;
    this.layoutReference = definition.layoutReference;
    this.sections = Object.freeze([...sections]);
    this.domainReferences = Object.freeze([
      ...(definition.domainReferences || []),
    ]);
    this.permissionReferences = Object.freeze([
      ...(definition.permissionReferences || []),
    ]);
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
