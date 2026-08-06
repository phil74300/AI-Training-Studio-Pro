const items = [

  {
    id: "chapters",
    icon: "📖",
    label: "Chapitres",
    active: true
  },

  {
    id: "sources",
    icon: "📚",
    label: "Sources"
  },

  {
    id: "media",
    icon: "🖼️",
    label: "Médias"
  },

  {
    id: "quiz",
    icon: "❓",
    label: "Quiz"
  },

  {
    id: "ai",
    icon: "🤖",
    label: "Assistant IA"
  },

  {
    id: "exports",
    icon: "📤",
    label: "Exports"
  },

  {
    id: "settings",
    icon: "⚙️",
    label: "Paramètres"
  }

];

export function WorkspaceSidebar() {

  return `

    <aside class="workspace-sidebar">

      <div class="workspace-sidebar-header">

        <h2>📂 Projet</h2>

        <small>AI Training Studio</small>

      </div>

      <nav class="workspace-sidebar-menu">

        ${items.map(item => `

          <button
            id="workspace-${item.id}"
            class="workspace-sidebar-item ${item.active ? "active" : ""}">

            <span class="workspace-sidebar-icon">

              ${item.icon}

            </span>

            <span class="workspace-sidebar-label">

              ${item.label}

            </span>

          </button>

        `).join("")}

      </nav>

      <div class="workspace-sidebar-footer">

        Projet ouvert

      </div>

    </aside>

  `;

}