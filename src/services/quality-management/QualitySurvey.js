export class QualitySurvey {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.surveyTemplateId ||
      !definition?.surveyTemplateVersion ||
      !definition?.trainingProgramId
    )
      throw new TypeError(
        "QualitySurvey requires id, surveyTemplateId, surveyTemplateVersion, and trainingProgramId."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.surveyTemplateId = definition.surveyTemplateId;
    this.surveyTemplateVersion = definition.surveyTemplateVersion;
    this.trainingProgramId = definition.trainingProgramId;
    this.trainingSessionId = definition.trainingSessionId || null;
    this.status = definition.status || "prepared";
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
