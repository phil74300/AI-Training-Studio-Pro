export const TrainingDocumentStatus = Object.freeze({
  DRAFT: "draft",
  IN_REVIEW: "in-review",
  APPROVED: "approved",
  ARCHIVED: "archived",
});

export const TrainingSectionType = Object.freeze({
  INTRODUCTION: "introduction",
  CONTENT: "content",
  THEORY: "theory",
  EXAMPLE: "example",
  PRACTICE: "practice",
  SUMMARY: "summary",
  REFERENCE: "reference",
});

export const TrainingContentBlockType = Object.freeze({
  PARAGRAPH: "paragraph",
  HEADING: "heading",
  LIST: "list",
  QUOTE: "quote",
  CALLOUT: "callout",
  TABLE: "table",
  CODE: "code",
  DIVIDER: "divider",
});

export const LearningObjectiveDomain = Object.freeze({
  KNOWLEDGE: "knowledge",
  SKILL: "skill",
  ATTITUDE: "attitude",
});

export const LearningTaxonomyLevel = Object.freeze({
  REMEMBER: "remember",
  UNDERSTAND: "understand",
  APPLY: "apply",
  ANALYZE: "analyze",
  EVALUATE: "evaluate",
  CREATE: "create",
});

export const AssessmentType = Object.freeze({
  QUIZ: "quiz",
  EXAM: "exam",
  SELF_CHECK: "self-check",
  PRACTICAL: "practical",
  OBSERVATION: "observation",
});

export const QuestionType = Object.freeze({
  SINGLE_CHOICE: "single-choice",
  MULTIPLE_CHOICE: "multiple-choice",
  TRUE_FALSE: "true-false",
  SHORT_ANSWER: "short-answer",
  LONG_ANSWER: "long-answer",
  SCENARIO: "scenario",
});

export const ActivityType = Object.freeze({
  DEMONSTRATION: "demonstration",
  DISCUSSION: "discussion",
  PRACTICE: "practice",
  SCENARIO: "scenario",
  REFLECTION: "reflection",
  ASSIGNMENT: "assignment",
});

export const MediaReferenceType = Object.freeze({
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  DIAGRAM: "diagram",
  DOCUMENT: "document",
  INTERACTIVE: "interactive",
});
