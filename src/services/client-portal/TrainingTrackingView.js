import { cloneValue } from "./ClientPortalValue";
export class TrainingTrackingView {
  constructor(d) {
    if (!d?.id) throw new TypeError("TrainingTrackingView requires id.");
    this.schemaVersion = 1;
    this.id = d.id;
    this.trainingReferences = Object.freeze([...(d.trainingReferences || [])]);
    this.sessionReferences = Object.freeze([...(d.sessionReferences || [])]);
    this.completionStatusReference = d.completionStatusReference || null;
    this.progressReferences = Object.freeze([...(d.progressReferences || [])]);
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
