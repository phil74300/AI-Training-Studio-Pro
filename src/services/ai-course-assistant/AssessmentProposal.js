import { cloneValue, normalizeProposal } from "./ProposalValue";

export class AssessmentProposal {
  constructor(definition) {
    Object.assign(this, normalizeProposal(definition, "AssessmentProposal"));
    this.quizQuestions = cloneValue(definition.quizQuestions || []);
    this.practicalExercises = cloneValue(definition.practicalExercises || []);
    this.evaluationCriteria = Object.freeze([
      ...(definition.evaluationCriteria || []),
    ]);
    this.learningObjectiveReferences = Object.freeze([
      ...(definition.learningObjectiveReferences || []),
    ]);
    Object.freeze(this);
  }
}
