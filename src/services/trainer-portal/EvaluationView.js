import { cloneValue } from "./TrainerPortalValue";
export class EvaluationView {
  constructor(d) {
    if (!d?.id || !d?.assessmentReference)
      throw new TypeError(
        "EvaluationView requires id and assessmentReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.assessmentReference = d.assessmentReference;
    this.correctionReference = d.correctionReference || null;
    this.humanValidationReference = d.humanValidationReference || null;
    this.aiProposalReference = d.aiProposalReference || null;
    this.aiProposalPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
