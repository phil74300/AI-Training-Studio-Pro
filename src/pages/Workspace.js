import { Header } from "../components/Header";
import { getCurrentProject } from "../services/WorkspaceService";
import { ChapterList } from "../components/ChapterList";

export function Workspace() {

  const project = getCurrentProject();

  if (!project) {
    return `
      <main class="content">

        ${Header("Workspace")}

        <p class="subtitle">
          Aucun projet ouvert.
        </p>

      </main>
    `;
  }

  return `
    <main class="content">

      ${Header(project.name)}

      <p class="subtitle">
        ${project.type}
      </p>

      <div class="workspace">

        <aside class="workspace-sidebar">

          <button>📑 Chapitres</button>
          <button>🤖 IA</button>
          <button>📚 Sources</button>
          <button>🖼 Images</button>
          <button>📄 Exports</button>
          <button>⚙ Paramètres</button>

        </aside>

        <section class="workspace-content">

          <div class="workspace-toolbar">

            <button
              id="newChapter"
              class="primary-button">
              ➕ Nouveau chapitre
            </button>

          </div>

          <h2>${project.name}</h2>

          <p>
            ${project.description || "Aucune description."}
          </p>

          ${ChapterList()}

        </section>

      </div>

    </main>
  `;
}