import { AssessmentValidation } from "./AssessmentValidation";
import { CorrectionMethod } from "./CorrectionMethod";
import { CorrectionResult } from "./CorrectionResult";
import { QuestionType } from "./QuestionType";
export class CorrectionEngine {
  correct(question, answer, options = {}) {
    if (
      ![
        QuestionType.SINGLE_CHOICE,
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.TRUE_FALSE,
        QuestionType.SHORT_TEXT,
      ].includes(question.type)
    )
      return new CorrectionResult({
        questionId: question.id,
        method: CorrectionMethod.HUMAN,
        comments: "Human correction is required.",
        validationState: AssessmentValidation.PENDING_HUMAN_VALIDATION,
      });
    const normalize = (value) =>
      Array.isArray(value)
        ? [...value].sort().join("|")
        : String(value ?? "")
            .trim()
            .toLowerCase();
    const correct =
      normalize(question.expectedAnswer) === normalize(answer.value);
    return new CorrectionResult({
      questionId: question.id,
      method: CorrectionMethod.AUTOMATIC,
      score: correct ? 1 : 0,
      validationState: options.certification
        ? AssessmentValidation.PENDING_HUMAN_VALIDATION
        : AssessmentValidation.HUMAN_VALIDATED,
    });
  }
  human(question, details) {
    return new CorrectionResult({
      questionId: question.id,
      method: CorrectionMethod.HUMAN,
      score: details.score,
      comments: details.comments,
      evaluatorId: details.evaluatorId,
      validationState: details.validated
        ? AssessmentValidation.HUMAN_VALIDATED
        : AssessmentValidation.PENDING_HUMAN_VALIDATION,
    });
  }
  aiAssisted(question, proposal) {
    return new CorrectionResult({
      questionId: question.id,
      method: CorrectionMethod.AI_ASSISTED,
      score: proposal.score,
      comments: proposal.reasoning,
      confidence: proposal.confidence,
      validationState: AssessmentValidation.PENDING_HUMAN_VALIDATION,
    });
  }
}
