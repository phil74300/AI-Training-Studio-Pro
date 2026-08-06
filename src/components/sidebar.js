import { hasProjectOpen } from "../services/WorkspaceService";

export function Sidebar(active = "dashboard") {

  const item = (id, icon, label) => `
    <button
      class="${active === id ? "active" : ""}"
      data-page="${id}">
      ${icon} ${label}
    </button>
  `;

  return `

    <aside class="sidebar">

      <h2>🤖 AI Training Studio</h2>

      ${item("dashboard", "🏠", "Dashboard")}
      ${item("projects", "📁", "Projets")}

      ${
        hasProjectOpen()
          ? item("workspace", "💼", "Workspace")
          : ""
      }

      ${item("books", "📚", "Livres")}
      ${item("training", "🎓", "Formations")}
      ${item("images", "🖼️", "Illustrations")}
      ${item("exports", "📄", "Exports")}
      ${item("settings", "⚙️", "Paramètres")}

    </aside>

  `;

}