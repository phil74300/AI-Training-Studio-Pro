export function ProjectModal() {
  return `
    <div class="modal-overlay hidden" id="projectModal">

      <div class="modal">

        <h2>📁 Nouveau projet</h2>

        <label>Nom du projet</label>
        <input
          id="projectName"
          type="text"
          placeholder="Ex. Manuel BLS-AED"
        />

        <label>Type</label>

        <select id="projectType">
          <option>Livre</option>
          <option>Formation</option>
          <option>SCORM</option>
          <option>Documentation</option>
        </select>

        <label>Description</label>

        <textarea
          id="projectDescription"
          rows="4"
          placeholder="Description..."
        ></textarea>

        <div class="modal-buttons">

          <button id="cancelProject">
            Annuler
          </button>

          <button
            id="createProject"
            class="primary-button"
          >
            Créer
          </button>

        </div>

      </div>

    </div>
  `;
}