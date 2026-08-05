import {
  getCurrentChapter,
  renameChapter,
  updateChapterContent
} from "../services/ChapterService";

export function ChapterEditor() {

  const chapter = getCurrentChapter();

  if (!chapter) {

    return `
      <div class="editor-empty">

        <h2>Aucun chapitre sélectionné</h2>

        <p>
          Créez ou sélectionnez un chapitre.
        </p>

      </div>
    `;

  }

  return `

    <div class="chapter-editor">

      <input
        id="chapterTitleEditor"
        class="editor-title"
        value="${chapter.title}"
      />

      <textarea
        id="chapterContentEditor"
        class="editor-content"
        placeholder="Commencez à écrire votre chapitre..."
      >${chapter.content}</textarea>

    </div>

  `;

}

export function initChapterEditor() {

  const chapter = getCurrentChapter();

  if (!chapter) {
    return;
  }

  const title =
    document.getElementById("chapterTitleEditor");

  const content =
    document.getElementById("chapterContentEditor");

  if (!title || !content) {
    return;
  }

  let saveTimer = null;

  title.addEventListener("input", () => {

    clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {

      await renameChapter(
        chapter.id,
        title.value
      );

    }, 300);

  });

  content.addEventListener("input", () => {

    clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {

      await updateChapterContent(
        chapter.id,
        content.value
      );

    }, 500);

  });

}