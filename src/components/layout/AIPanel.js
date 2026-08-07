/* ==========================================================
   AI TRAINING STUDIO
   AI Panel
========================================================== */

const ACTIONS = [
  {
    id: "generate",
    icon: "✨",
    title: "Générer",
    description: "Créer un chapitre",
  },

  {
    id: "rewrite",
    icon: "✍️",
    title: "Réécrire",
    description: "Améliorer le texte",
  },

  {
    id: "correct",
    icon: "📝",
    title: "Corriger",
    description: "Orthographe & style",
  },

  {
    id: "summary",
    icon: "📄",
    title: "Résumer",
    description: "Créer un résumé",
  },

  {
    id: "translate",
    icon: "🌍",
    title: "Traduire",
    description: "Changer de langue",
  },
];

export function AIPanel() {
  return `

        <aside class="ai-panel">

            <header class="ai-header">

                <h2>🤖 Assistant IA</h2>

                <p>Aucune conversation active</p>

            </header>

            <section class="ai-actions">

                ${ACTIONS.map(
                  (action) => `

                    <button
                        id="ai-${action.id}"
                        class="ai-button">

                        <span class="ai-icon">

                            ${action.icon}

                        </span>

                        <div class="ai-text">

                            <strong>

                                ${action.title}

                            </strong>

                            <small>

                                ${action.description}

                            </small>

                        </div>

                    </button>

                `
                ).join("")}

            </section>

            <footer class="ai-footer">

                <small>

                    GPT non connecté

                </small>

            </footer>

        </aside>

    `;
}
