export class LearnerAnswer {
  constructor(value) {
    if (!value?.questionId || !value?.learnerId)
      throw new TypeError("LearnerAnswer requires questionId and learnerId.");
    this.schemaVersion = 1;
    this.questionId = value.questionId;
    this.learnerId = value.learnerId;
    this.value = value.value ?? null;
    this.submittedAt = new Date(value.submittedAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
