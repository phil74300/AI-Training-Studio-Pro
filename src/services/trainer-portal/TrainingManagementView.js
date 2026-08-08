import { cloneValue } from "./TrainerPortalValue";
export class TrainingManagementView {
  constructor(d) {
    if (
      !d?.id ||
      !d?.trainingReference ||
      !d?.versionReference ||
      !d?.validationStateReference
    )
      throw new TypeError(
        "TrainingManagementView requires id, trainingReference, versionReference, and validationStateReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainingReference = d.trainingReference;
    this.versionReference = d.versionReference;
    this.moduleReferences = Object.freeze([...(d.moduleReferences || [])]);
    this.objectiveReferences = Object.freeze([
      ...(d.objectiveReferences || []),
    ]);
    this.mediaReferences = Object.freeze([...(d.mediaReferences || [])]);
    this.validationStateReference = d.validationStateReference;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
