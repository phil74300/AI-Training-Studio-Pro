import { createChapter } from "../services/ChapterService";

export function ChapterModal() {
  return `
    <div id="chapterModal" class="modal-overlay hidden">

      <div class="modal">

        <h2>Nouveau chapitre</h2>

        <input
          id="newChapterTitle"
          type="text"
          placeholder="Titre du chapitre"
        />

        <div class="modal-buttons">

          <button
            id="cancelChapter"
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

export function initChapterModal(refresh) {
  const modal = document.getElementById("chapterModal");
  const title = document.getElementById("newChapterTitle");

  if (!modal || !title) {
    return;
  }

  const newButton = document.getElementById("newChapter");
  const cancelButton = document.getElementById("cancelChapter");
  const createButton = document.getElementById("createChapter");

  newButton.onclick = () => {
    title.value = "";

    modal.classList.remove("hidden");

    title.focus();
  };

  cancelButton.onclick = () => {
    modal.classList.add("hidden");
  };

  createButton.onclick = async () => {
    const value = title.value.trim();

    if (!value) {
      return;
    }

    await createChapter(value);

    modal.classList.add("hidden");

    refresh();
  };

  modal.onclick = (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.classList.add("hidden");
    }
  });
}
