const actions = [

  {
    icon: "✨",
    title: "Générer",
    description: "Créer un chapitre"
  },

  {
    icon: "✍",
    title: "Réécrire",
    description: "Améliorer le texte"
  },

  {
    icon: "📝",
    title: "Corriger",
    description: "Orthographe & style"
  },

  {
    icon: "📄",
    title: "Résumer",
    description: "Créer un résumé"
  },

  {
    icon: "🌍",
    title: "Traduire",
    description: "Changer de langue"
  }

];

export function AIPanel() {

  return `

<aside class="ai-panel">

    <div class="ai-header">

        <h2>🤖 Assistant IA</h2>

        <p>

            Aucune conversation

        </p>

    </div>

    <div class="ai-actions">

        ${actions.map(action => `

            <button
                class="ai-button"
                id="ai-${action.title.toLowerCase()}">

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

        `).join("")}

    </div>

    <div class="ai-footer">

        <small>

            GPT non connecté

        </small>

    </div>

</aside>

`;

}