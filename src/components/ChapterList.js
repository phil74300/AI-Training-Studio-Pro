import { getChapters, getCurrentChapter } from "../services/ChapterService";

import { ChapterCard, initChapterCards } from "./ChapterCard";

export function ChapterList() {
  const chapters = getChapters();
  const currentChapterId = getCurrentChapter()?.id;

  if (chapters.length === 0) {
    return `
      <div class="chapter-empty">

        <span class="chapter-empty-icon">📖</span>

        <h3>Pas encore de chapitre</h3>

        <p>Créez votre premier chapitre pour commencer.</p>

        <button
          id="createFirstChapter"
          class="primary-button">

          Créer un chapitre

        </button>

      </div>
    `;
  }

  let html = `<div class="chapter-list">`;

  chapters.forEach((chapter) => {
    html += ChapterCard(chapter, chapter.id === currentChapterId);
  });

  html += `</div>`;

  return html;
}

export function initChapterList(onSelect, signal) {
  initChapterCards(onSelect, signal);
}
