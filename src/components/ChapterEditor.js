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
          Sélectionnez ou créez un chapitre.
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
      >${chapter.content}</textarea>

    </div>

  `;

}

export function initChapterEditor() {

  const chapter = getCurrentChapter();

  if (!chapter) return;

  const title = document.getElementById("chapterTitleEditor");
  const content = document.getElementById("chapterContentEditor");

  title.oninput = () => {
    renameChapter(chapter.id, title.value);
  };

  content.oninput = () => {
    updateChapterContent(chapter.id, content.value);
  };

}