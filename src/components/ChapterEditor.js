import {
  getCurrentChapter,
  renameChapter,
  updateChapterContent,
} from "../services/ChapterService";

import { createEditor, destroyEditor } from "./editor/RichEditor";

import { Toolbar, initToolbar } from "./editor/Toolbar";

export function ChapterEditor() {
  const chapter = getCurrentChapter();

  if (!chapter) {
    return `
      <div class="editor-empty">

        <h2>Aucun chapitre sélectionné</h2>

        <p>Sélectionnez ou créez un chapitre.</p>

      </div>
    `;
  }

  return `

    <div class="chapter-editor">

      ${Toolbar()}

      <input
        id="chapterTitle"
        class="editor-title"
        value="${chapter.title}"
      />

      <div
        id="editor"
        class="editor-content">
      </div>

    </div>

  `;
}

export function initChapterEditor(signal) {
  const chapter = getCurrentChapter();

  if (!chapter) return;

  const element = document.getElementById("editor");

  if (!element) return;

  destroyEditor();

  createEditor({
    element,

    content: chapter.content || "",

    onUpdate(html) {
      updateChapterContent(chapter.id, html);
    },
  });

  initToolbar(signal);

  const title = document.getElementById("chapterTitle");

  if (title) {
    title.value = chapter.title;

    title.addEventListener(
      "input",
      () => {
        renameChapter(chapter.id, title.value);
      },
      { signal }
    );
  }
}

export function destroyChapterEditor() {
  destroyEditor();
}
