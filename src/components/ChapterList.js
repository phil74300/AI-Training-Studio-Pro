import {
  getChapters
} from "../services/ChapterService";

export function ChapterList() {

  const chapters = getChapters();

  if (chapters.length === 0) {

    return `
      <p>
        Aucun chapitre.
      </p>
    `;

  }

  return chapters.map(chapter => `

      <div class="chapter-item">

          📑 ${chapter.title}

      </div>

  `).join("");

}