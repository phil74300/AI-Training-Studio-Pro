import { getCurrentChapter } from "../services/ChapterService";

export function ChapterCard(chapter) {

  const current = getCurrentChapter();

  const active = current?.id === chapter.id;

  return `
    <div
      class="chapter-card ${active ? "active" : ""}"
      data-id="${chapter.id}">

      <div class="chapter-icon">
        📑
      </div>

      <div class="chapter-info">
        <h4>${chapter.title}</h4>
        <small>${chapter.createdAt}</small>
      </div>

    </div>
  `;
}