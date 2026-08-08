import { cloneValue } from "./AdminPortalValue";
export class TrainingAdministrationView {
  constructor(d) {
    if (
      !d?.id ||
      !d?.catalogReference ||
      !d?.validationStateReference ||
      !d?.lifecycleStateReference
    )
      throw new TypeError(
        "TrainingAdministrationView requires id, catalogReference, validationStateReference, and lifecycleStateReference."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.catalogReference = d.catalogReference;
    this.trainingVersionReferences = Object.freeze([
      ...(d.trainingVersionReferences || []),
    ]);
    this.validationStateReference = d.validationStateReference;
    this.publicationReference = d.publicationReference || null;
    this.lifecycleStateReference = d.lifecycleStateReference;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
