import { cloneValue } from "./QualityPortalValue";
export class SurveyManagementView {
  constructor(d) {
    if (!d?.id) throw new TypeError("SurveyManagementView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.surveyReferences = Object.freeze([...(d.surveyReferences || [])]);
    this.courseSatisfactionReference = d.courseSatisfactionReference || null;
    this.trainingSatisfactionReference =
      d.trainingSatisfactionReference || null;
    this.trainerSatisfactionReference = d.trainerSatisfactionReference || null;
    this.responseAggregationReferences = Object.freeze([
      ...(d.responseAggregationReferences || []),
    ]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
