import { selectChapter } from "../services/ChapterService";

export function ChapterCard(chapter, refresh) {

  return `
    <div
      class="chapter-card"
      data-id="${chapter.id}">

      <div class="chapter-icon">
        📑
      </div>

      <div class="chapter-info">

        <h4>${chapter.title}</h4>

        <small>
          ${chapter.createdAt}
        </small>

      </div>

    </div>
  `;

}

export function initChapterCards(refresh) {

  document
    .querySelectorAll(".chapter-card")
    .forEach(card => {

      card.onclick = () => {

        selectChapter(card.dataset.id);

        refresh();

      };

    });

}