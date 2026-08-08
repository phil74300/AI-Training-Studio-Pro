export class AttendanceRecord {
  constructor(value) {
    if (!value?.enrollmentId)
      throw new TypeError("AttendanceRecord requires enrollmentId.");
    this.schemaVersion = 1;
    this.enrollmentId = value.enrollmentId;
    this.status = value.status || "unknown";
    this.arrivalReference = value.arrivalReference || null;
    this.completionEvidence = Object.freeze([
      ...(value.completionEvidence || []),
    ]);
    this.recordedAt = new Date(value.recordedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
