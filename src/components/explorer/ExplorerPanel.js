export function createExplorerPanel({ id, title, icon }) {
  return {
    id,
    title,
    icon,

    render({ active = false } = {}) {
      return `

        <button
            id="workspace-${id}"
            class="workspace-sidebar-item ${active ? "active" : ""}"
            data-panel="${id}">

            <span class="workspace-sidebar-icon">

                ${icon}

            </span>

            <span class="workspace-sidebar-label">

                ${title}

            </span>

        </button>

      `;
    },

    mount() {},

    destroy() {},
  };
}
