export class Certification {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !definition?.issuingOrganizationId ||
      !definition?.learningProgramId ||
      !definition?.validityRuleId
    )
      throw new TypeError(
        "Certification requires id, title, issuingOrganizationId, learningProgramId, and validityRuleId."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.description = definition.description || null;
    this.issuingOrganizationId = definition.issuingOrganizationId;
    this.learningProgramId = definition.learningProgramId;
    this.assessmentRequirementIds = Object.freeze([
      ...(definition.assessmentRequirementIds || []),
    ]);
    this.version = definition.version || "1.0";
    this.validityRuleId = definition.validityRuleId;
    this.status = definition.status || "draft";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
