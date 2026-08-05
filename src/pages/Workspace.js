import { Header } from "../components/Header";
import {
  ChapterList,
  initChapterList
} from "../components/ChapterList";

import {
  ChapterModal,
  initChapterModal
} from "../components/ChapterModal";

import {
  ChapterEditor,
  initChapterEditor
} from "../components/ChapterEditor";

import {
  getCurrentProject
} from "../services/WorkspaceService";

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

          ${ChapterList(renderWorkspace)}

          <hr class="workspace-separator">

          ${ChapterEditor()}

        </section>

      </div>

      ${ChapterModal()}

    </main>

  `;

}

export function initWorkspace() {

  initChapterList(renderWorkspace);

  initChapterModal(renderWorkspace);

  requestAnimationFrame(() => {

    if (document.getElementById("editor")) {
      initChapterEditor();
    }

  });

}

function renderWorkspace() {

  window.navigate("workspace");

}