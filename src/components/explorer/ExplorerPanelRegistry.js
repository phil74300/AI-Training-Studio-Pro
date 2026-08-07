import { explorerPanels } from "./panels";

const panels = new Map();

let activePanelId = null;
let mountedPanel = null;

export function registerExplorerPanel(panel) {
  if (
    !panel?.id ||
    typeof panel.render !== "function" ||
    typeof panel.mount !== "function" ||
    typeof panel.destroy !== "function"
  ) {
    throw new Error("ExplorerPanelRegistry : panneau invalide.");
  }

  panels.set(panel.id, panel);

  if (!activePanelId) {
    activePanelId = panel.id;
  }
}

explorerPanels.forEach(registerExplorerPanel);

export function getExplorerPanels() {
  return [...panels.values()];
}

export function getActiveExplorerPanel() {
  return panels.get(activePanelId) || null;
}

export function mountActiveExplorerPanel(context) {
  const panel = getActiveExplorerPanel();

  if (!panel || mountedPanel === panel) {
    return;
  }

  panel.mount(context);
  mountedPanel = panel;
}

export function setActiveExplorerPanel(id) {
  const panel = panels.get(id);

  if (!panel || panel.id === activePanelId) {
    return false;
  }

  destroyActiveExplorerPanel();

  activePanelId = panel.id;

  return true;
}

export function destroyActiveExplorerPanel() {
  if (!mountedPanel) {
    return;
  }

  mountedPanel.destroy();
  mountedPanel = null;
}

export function resetExplorerPanels() {
  destroyActiveExplorerPanel();
  activePanelId = panels.has("chapters") ? "chapters" : null;
}
