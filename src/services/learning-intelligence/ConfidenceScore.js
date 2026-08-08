export class ConfidenceScore {
  constructor(value) {
    const score = value?.score ?? value;
    if (typeof score !== "number" || score < 0 || score > 1)
      throw new TypeError("ConfidenceScore must be between 0 and 1.");
    this.schemaVersion = 1;
    this.score = score;
    Object.freeze(this);
  }

  static from(value) {
    return value instanceof ConfidenceScore
      ? value
      : new ConfidenceScore(value);
  }
}
