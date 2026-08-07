export function renderExplorerPanelButton(panel, { active = false } = {}) {
  return `

    <button
        id="workspace-${panel.id}"
        class="workspace-sidebar-item ${active ? "active" : ""}"
        data-panel="${panel.id}">

        <span class="workspace-sidebar-icon">

            ${panel.icon}

        </span>

        <span class="workspace-sidebar-label">

            ${panel.title}

        </span>

    </button>

  `;
}

export function createExplorerPanel({ id, title, icon }) {
  return {
    id,
    title,
    icon,

    render() {
      return `

        <div class="explorer-panel-placeholder">

            <strong>${title}</strong>

            <p>Fonctionnalité bientôt disponible.</p>

        </div>

      `;
    },

    mount() {},

    destroy() {},
  };
}
