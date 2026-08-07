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

export function initChapterModal(refresh, signal) {
  const modal = document.getElementById("chapterModal");
  const title = document.getElementById("newChapterTitle");

  if (!modal || !title) {
    return;
  }

  const newButton = document.getElementById("newChapter");
  const cancelButton = document.getElementById("cancelChapter");
  const createButton = document.getElementById("createChapter");

  newButton.addEventListener(
    "click",
    () => {
      title.value = "";

      modal.classList.remove("hidden");

      title.focus();
    },
    { signal }
  );

  cancelButton.addEventListener(
    "click",
    () => {
      modal.classList.add("hidden");
    },
    { signal }
  );

  createButton.addEventListener(
    "click",
    async () => {
      const value = title.value.trim();

      if (!value) {
        return;
      }

      await createChapter(value);

      modal.classList.add("hidden");

      refresh();
    },
    { signal }
  );

  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        modal.classList.add("hidden");
      }
    },
    { signal }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        modal.classList.add("hidden");
      }
    },
    { signal }
  );
}
