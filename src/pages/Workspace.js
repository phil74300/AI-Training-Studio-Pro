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
  WorkspaceLayout
} from "../components/layout/WorkspaceLayout";

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

  const content = `

      <div class="workspace-editor">

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

      </div>

  `;

  return `

    <main class="content">

      ${Header(project.name)}

      <p class="subtitle">

        ${project.type}

      </p>

      ${WorkspaceLayout(content)}

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