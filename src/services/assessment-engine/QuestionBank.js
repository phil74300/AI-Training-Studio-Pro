import { AssessmentQuestion } from "./AssessmentQuestion";
export class QuestionBank {
  constructor(questions = []) {
    this.schemaVersion = 1;
    this.questions = Object.freeze(
      questions.map((question) =>
        question instanceof AssessmentQuestion
          ? question
          : new AssessmentQuestion(question)
      )
    );
    Object.freeze(this);
  }
  find(id) {
    return this.questions.find((question) => question.id === id) || null;
  }
}
