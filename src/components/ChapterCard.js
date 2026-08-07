export function ChapterCard(chapter) {
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

export function initChapterCards(onSelect, signal) {
  document.querySelectorAll(".chapter-card").forEach((card) => {
    card.addEventListener(
      "click",
      () => {
        onSelect(card.dataset.id);
      },
      { signal }
    );
  });
}
