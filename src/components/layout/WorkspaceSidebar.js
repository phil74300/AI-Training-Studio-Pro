import {
  getActiveExplorerPanel,
  getExplorerPanels,
  mountActiveExplorerPanel,
  setActiveExplorerPanel,
  destroyActiveExplorerPanel,
} from "../explorer/ExplorerPanelRegistry";

export function WorkspaceSidebar() {
  return `

        <aside class="workspace-sidebar">

            <header class="workspace-sidebar-header">

                <h2>📂 Projet</h2>

                <small>AI Training Studio</small>

            </header>

            <nav class="workspace-sidebar-menu">

                ${getExplorerPanels()
                  .map((panel) =>
                    panel.render({
                      active: panel.id === getActiveExplorerPanel()?.id,
                    })
                  )
                  .join("")}

            </nav>

            <footer class="workspace-sidebar-footer">

                Projet ouvert

            </footer>

        </aside>

    `;
}

export function initWorkspaceSidebar(signal) {
  getExplorerPanels().forEach((panel) => {
    const button = document.getElementById(`workspace-${panel.id}`);

    if (!button) return;

    button.addEventListener(
      "click",
      () => {
        if (setActiveExplorerPanel(panel.id)) {
          updateActivePanel();
        }
      },
      { signal }
    );
  });

  mountActiveExplorerPanel();
}

export function destroyWorkspaceSidebar() {
  destroyActiveExplorerPanel();
}

function updateActivePanel() {
  const activePanel = getActiveExplorerPanel();

  getExplorerPanels().forEach((panel) => {
    const button = document.getElementById(`workspace-${panel.id}`);

    if (!button) return;

    button.classList.toggle("active", panel.id === activePanel?.id);
  });
}
