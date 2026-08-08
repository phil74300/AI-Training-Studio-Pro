export class SurveyResponse {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.qualitySurveyId ||
      !definition?.surveyTemplateVersion ||
      !definition?.participantReference ||
      !definition?.trainingSessionId ||
      !definition?.submittedAt
    )
      throw new TypeError(
        "SurveyResponse requires id, qualitySurveyId, surveyTemplateVersion, participantReference, trainingSessionId, and submittedAt."
      );
    if (!Array.isArray(definition.answers))
      throw new TypeError("SurveyResponse answers must be an array.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.qualitySurveyId = definition.qualitySurveyId;
    this.surveyTemplateVersion = definition.surveyTemplateVersion;
    this.participantReference = definition.participantReference;
    this.trainingSessionId = definition.trainingSessionId;
    this.answers = Object.freeze([...(definition.answers || [])]);
    this.comments = Object.freeze([...(definition.comments || [])]);
    this.submittedAt = new Date(definition.submittedAt).toISOString();
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
