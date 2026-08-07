import { getChapters } from "../services/ChapterService";

import { ChapterCard, initChapterCards } from "./ChapterCard";

export function ChapterList() {
  const chapters = getChapters();

  if (chapters.length === 0) {
    return `
      <div class="chapter-empty">

        <h3>Aucun chapitre</h3>

        <p>
          Cliquez sur <strong>Nouveau chapitre</strong>
          pour commencer.
        </p>

      </div>
    `;
  }

  let html = `<div class="chapter-list">`;

  chapters.forEach((chapter) => {
    html += ChapterCard(chapter);
  });

  html += `</div>`;

  return html;
}

export function initChapterList(refresh, signal) {
  initChapterCards(refresh, signal);
}
