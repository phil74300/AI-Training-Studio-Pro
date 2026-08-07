/* ==========================================================
   AI TRAINING STUDIO
   Status Bar
========================================================== */

import { getAIStatusLabel } from "../../services/ai/AIStatus";
import { observeWorkspaceStatus } from "../../services/workspace/WorkspaceStatusService";

const EXPORTS = [
  {
    id: "html",
    label: "HTML",
  },

  {
    id: "pdf",
    label: "PDF",
  },

  {
    id: "docx",
    label: "DOCX",
  },

  {
    id: "scorm",
    label: "SCORM",
  },
];

let cleanup = null;

export function StatusBar() {
  return `

        <footer class="status-bar">

            <div class="status-left">

                <span
                    id="status-project"
                    class="status-item">

                    📂 Aucun projet

                </span>

                <span
                    id="status-chapter"
                    class="status-item">

                    📑 Aucun chapitre

                </span>

                <span
                    id="status-chapter-count"
                    class="status-item">

                    📚 0 chapitre

                </span>

            </div>

            <div class="status-center">

                <span
                    id="status-save"
                    class="status-item">

                    💾 Sauvegarde automatique

                </span>

                <span
                    id="status-ai"
                    class="status-item">

                    🤖 IA inactive

                </span>

            </div>

            <div class="status-right">

                <span
                    id="status-version"
                    class="status-item">

                    v—

                </span>

                ${EXPORTS.map(
                  (format) => `

                    <button
                        id="export-${format.id}"
                        class="status-button">

                        ${format.label}

                    </button>

                `
                ).join("")}

            </div>

        </footer>

    `;
}

export function initStatusBar(signal) {
  destroyStatusBar();

  cleanup = observeWorkspaceStatus((workspace) => {
    updateStatusItem(
      "status-project",
      `📂 ${workspace.activeProject?.name || "Aucun projet"}`
    );
    updateStatusItem(
      "status-chapter",
      `📑 ${workspace.activeChapter?.title || "Aucun chapitre"}`
    );
    updateStatusItem(
      "status-chapter-count",
      `📚 ${workspace.chapterCount || 0} chapitre${workspace.chapterCount === 1 ? "" : "s"}`
    );
    updateStatusItem(
      "status-save",
      `💾 ${workspace.saveStatus || "Sauvegarde automatique"}`
    );
    updateStatusItem("status-ai", `🤖 ${getAIStatusLabel(workspace.aiStatus)}`);
    updateStatusItem("status-version", `v${workspace.applicationVersion}`);
  });

  signal?.addEventListener("abort", destroyStatusBar, { once: true });
}

export function destroyStatusBar() {
  cleanup?.();
  cleanup = null;
}

function updateStatusItem(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}
