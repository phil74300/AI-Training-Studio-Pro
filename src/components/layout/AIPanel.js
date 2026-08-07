import { AIAction, getAIActions } from "../../services/ai/AIAction";
import { observeAIWorkspace } from "../../services/ai/AIWorkspaceService";
import { getAIStatusLabel } from "../../services/ai/AIStatus";

const panelActions = getAIActions([
  AIAction.GENERATE_LESSON,
  AIAction.IMPROVE_TEXT,
  AIAction.CORRECT_TEXT,
  AIAction.SUMMARIZE,
  AIAction.TRANSLATE,
]);

let cleanup = null;

export function AIPanel() {
  return `

        <aside class="ai-panel">

            <header class="ai-header">

                <h2>🤖 Assistant IA</h2>

                <p>Aucune conversation active</p>

            </header>

            <section class="ai-actions">

                ${panelActions
                  .map(
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
                  )
                  .join("")}

            </section>

            <footer class="ai-footer">

                <small>

                    <span id="ai-status">IA inactive</span>

                </small>

            </footer>

        </aside>

    `;
}

export function initAIPanel(signal) {
  destroyAIPanel();

  cleanup = observeAIWorkspace(({ status }) => {
    const statusElement = document.getElementById("ai-status");

    if (statusElement) {
      statusElement.textContent = getAIStatusLabel(status);
    }
  });

  signal?.addEventListener("abort", destroyAIPanel, { once: true });
}

export function destroyAIPanel() {
  cleanup?.();
  cleanup = null;
}
