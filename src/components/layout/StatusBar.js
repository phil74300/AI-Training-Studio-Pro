/* ==========================================================
   AI TRAINING STUDIO
   Status Bar
========================================================== */

const EXPORTS = [

    {
        id: "html",
        label: "HTML"
    },

    {
        id: "pdf",
        label: "PDF"
    },

    {
        id: "docx",
        label: "DOCX"
    },

    {
        id: "scorm",
        label: "SCORM"
    }

];

export function StatusBar() {

    return `

        <footer class="status-bar">

            <div class="status-left">

                <span
                    id="status-words"
                    class="status-item">

                    📝 0 mots

                </span>

                <span
                    id="status-reading"
                    class="status-item">

                    ⏱ 0 min

                </span>

                <span
                    id="status-language"
                    class="status-item">

                    🇫🇷 Français

                </span>

            </div>

            <div class="status-center">

                <span
                    id="status-save"
                    class="status-item">

                    💾 Sauvegarde automatique

                </span>

            </div>

            <div class="status-right">

                ${EXPORTS.map(format => `

                    <button
                        id="export-${format.id}"
                        class="status-button">

                        ${format.label}

                    </button>

                `).join("")}

            </div>

        </footer>

    `;

}