export function ChapterModal() {
  return `
    <div id="chapterModal" class="modal hidden">

      <div class="modal-content">

        <h2>Nouveau chapitre</h2>

        <input
          id="chapterTitle"
          placeholder="Titre du chapitre"
        />

        <div class="modal-actions">

          <button
            id="cancelChapter"
            class="secondary-button">
            Annuler
          </button>

          <button
            id="createChapter"
            class="primary-button">
            Créer
          </button>

        </div>

      </div>

    </div>
  `;
}