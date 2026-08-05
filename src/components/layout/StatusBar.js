export function StatusBar() {

  return `

<footer class="status-bar">

    <div class="status-left">

        <span id="status-words">

            📝 0 mots

        </span>

        <span id="status-reading">

            ⏱ 0 min

        </span>

        <span id="status-language">

            🇫🇷 Français

        </span>

    </div>

    <div class="status-center">

        <span id="status-save">

            💾 Sauvegarde automatique

        </span>

    </div>

    <div class="status-right">

        <button class="status-button">

            HTML

        </button>

        <button class="status-button">

            PDF

        </button>

        <button class="status-button">

            DOCX

        </button>

        <button class="status-button">

            SCORM

        </button>

    </div>

</footer>

`;

}