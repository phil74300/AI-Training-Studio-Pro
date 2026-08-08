export const AIAction = Object.freeze({
  GENERATE_LESSON: "generate-lesson",
  IMPROVE_TEXT: "improve-text",
  CORRECT_TEXT: "correct-text",
  SUMMARIZE: "summarize",
  TRANSLATE: "translate",
  GENERATE_QUIZ: "generate-quiz",
  GENERATE_IMAGE: "generate-image",
  EXPLAIN: "explain",
  ANALYZE_TRAINING_DOCUMENT: "analyze-training-document",
});

export const aiActions = Object.freeze([
  {
    id: AIAction.GENERATE_LESSON,
    icon: "✨",
    title: "Générer",
    description: "Créer un chapitre",
  },
  {
    id: AIAction.IMPROVE_TEXT,
    icon: "✍️",
    title: "Réécrire",
    description: "Améliorer le texte",
  },
  {
    id: AIAction.CORRECT_TEXT,
    icon: "📝",
    title: "Corriger",
    description: "Orthographe & style",
  },
  {
    id: AIAction.SUMMARIZE,
    icon: "📄",
    title: "Résumer",
    description: "Créer un résumé",
  },
  {
    id: AIAction.TRANSLATE,
    icon: "🌍",
    title: "Traduire",
    description: "Changer de langue",
  },
  {
    id: AIAction.GENERATE_QUIZ,
    icon: "❓",
    title: "Générer un quiz",
    description: "Créer des questions",
  },
  {
    id: AIAction.GENERATE_IMAGE,
    icon: "🖼️",
    title: "Générer une image",
    description: "Créer une illustration",
  },
  {
    id: AIAction.EXPLAIN,
    icon: "💡",
    title: "Expliquer",
    description: "Clarifier un passage",
  },
]);

export function getAIActions(ids = []) {
  return ids
    .map((id) => aiActions.find((action) => action.id === id))
    .filter(Boolean);
}
