export class TrainingSession {
  constructor(value) {
    if (
      !value?.id ||
      !value?.programId ||
      !value?.trainerId ||
      !value?.startsAt
    )
      throw new TypeError(
        "TrainingSession requires id, programId, trainerId, and startsAt."
      );
    this.schemaVersion = 1;
    this.id = value.id;
    this.programId = value.programId;
    this.trainerId = value.trainerId;
    this.startsAt = new Date(value.startsAt).toISOString();
    this.endsAt = value.endsAt ? new Date(value.endsAt).toISOString() : null;
    this.locationReference = value.locationReference || null;
    this.capacity = value.capacity ?? null;
    this.status = value.status || "planned";
    Object.freeze(this);
  }
}
