/* ==========================================================
   AI TRAINING STUDIO
   Workspace Sidebar
========================================================== */

const MENU = [

    {
        id: "chapters",
        icon: "📖",
        label: "Chapitres"
    },

    {
        id: "sources",
        icon: "📚",
        label: "Sources"
    },

    {
        id: "media",
        icon: "🖼️",
        label: "Médias"
    },

    {
        id: "quiz",
        icon: "❓",
        label: "Quiz"
    },

    {
        id: "ai",
        icon: "🤖",
        label: "Assistant IA"
    },

    {
        id: "exports",
        icon: "📤",
        label: "Exports"
    },

    {
        id: "settings",
        icon: "⚙️",
        label: "Paramètres"
    }

];

const ACTIVE_PANEL = "chapters";

export function WorkspaceSidebar() {

    return `

        <aside class="workspace-sidebar">

            <header class="workspace-sidebar-header">

                <h2>📂 Projet</h2>

                <small>AI Training Studio</small>

            </header>

            <nav class="workspace-sidebar-menu">

                ${MENU.map(item => `

                    <button
                        id="workspace-${item.id}"
                        class="workspace-sidebar-item ${item.id === ACTIVE_PANEL ? "active" : ""}"
                        data-panel="${item.id}">

                        <span class="workspace-sidebar-icon">

                            ${item.icon}

                        </span>

                        <span class="workspace-sidebar-label">

                            ${item.label}

                        </span>

                    </button>

                `).join("")}

            </nav>

            <footer class="workspace-sidebar-footer">

                Projet ouvert

            </footer>

        </aside>

    `;

}