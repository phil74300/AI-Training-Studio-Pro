import { cloneValue } from "./TrainerPortalValue";
export class SessionManagementView {
  constructor(d) {
    if (
      !d?.id ||
      !d?.sessionReference ||
      !d?.dateReference ||
      !d?.locationReference ||
      d?.capacity === undefined
    )
      throw new TypeError(
        "SessionManagementView requires id, sessionReference, dateReference, locationReference, and capacity."
      );
    this.schemaVersion = 1;
    this.id = d.id;
    this.sessionReference = d.sessionReference;
    this.dateReference = d.dateReference;
    this.locationReference = d.locationReference;
    this.capacity = d.capacity;
    this.participantReferences = Object.freeze([
      ...(d.participantReferences || []),
    ]);
    this.attendanceReference = d.attendanceReference || null;
    this.provenance = cloneValue(d.provenance || {});
    Object.freeze(this);
  }
}
