import {
  getChapters,
  selectChapter
} from "../services/ChapterService";

import { ChapterCard } from "./ChapterCard";

export function ChapterList(refresh) {

  const chapters = getChapters();

  if (chapters.length === 0) {

    return `
      <p class="empty-message">
        Aucun chapitre.
      </p>
    `;

  }

  return chapters.map(chapter => `
      ${ChapterCard(chapter)}
  `).join("");

}

export function initChapterList(refresh) {

  document.querySelectorAll(".chapter-card").forEach(card => {

    card.onclick = () => {

      selectChapter(card.dataset.id);

      refresh();

    };

  });

}