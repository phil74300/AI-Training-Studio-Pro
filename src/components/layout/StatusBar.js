/* ==========================================================
   AI TRAINING STUDIO
   Status Bar
========================================================== */

import { observeAIWorkspace } from "../../services/ai/AIWorkspaceService";
import { getAIStatusLabel } from "../../services/ai/AIStatus";

const APPLICATION_VERSION = "1.0.0";

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

                    v${APPLICATION_VERSION}

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

export function initStatusBar({ getWorkspaceState, signal } = {}) {
  destroyStatusBar();

  const updateStatusBar = ({ status }) => {
    const workspace = getWorkspaceState?.() || {};

    updateStatusItem(
      "status-project",
      `📂 ${workspace.projectName || "Aucun projet"}`
    );
    updateStatusItem(
      "status-chapter",
      `📑 ${workspace.chapterTitle || "Aucun chapitre"}`
    );
    updateStatusItem(
      "status-chapter-count",
      `📚 ${workspace.chapterCount || 0} chapitre${workspace.chapterCount === 1 ? "" : "s"}`
    );
    updateStatusItem(
      "status-save",
      `💾 ${workspace.saveStatus || "Sauvegarde automatique"}`
    );
    updateStatusItem(
      "status-ai",
      `🤖 ${getAIStatusLabel(workspace.aiStatus || status)}`
    );
  };

  cleanup = observeAIWorkspace(updateStatusBar);

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
