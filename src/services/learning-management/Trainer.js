export class Trainer {
  constructor(value) {
    if (!value?.id) throw new TypeError("Trainer requires id.");
    this.schemaVersion = 1;
    this.id = value.id;
    this.qualificationReferences = Object.freeze([
      ...(value.qualificationReferences || []),
    ]);
    this.assignedProgramIds = Object.freeze([
      ...(value.assignedProgramIds || []),
    ]);
    this.active = value.active !== false;
    this.qualityReferences = Object.freeze({
      trainerEvaluations: [
        ...(value.qualityReferences?.trainerEvaluations || []),
      ],
      satisfactionFeedback: [
        ...(value.qualityReferences?.satisfactionFeedback || []),
      ],
      improvementActions: [
        ...(value.qualityReferences?.improvementActions || []),
      ],
    });
    Object.freeze(this);
  }
}
