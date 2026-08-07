import { ChapterList, initChapterList } from "../../ChapterList";

export const ChaptersPanel = {
  id: "chapters",
  title: "Chapitres",
  icon: "📖",

  render() {
    return `

      <div class="explorer-chapters">

        <div class="workspace-toolbar">

          <button
              id="newChapter"
              class="primary-button">

              ➕ Nouveau chapitre

          </button>

        </div>

        ${ChapterList()}

      </div>

    `;
  },

  mount({ onChapterSelect, signal } = {}) {
    if (typeof onChapterSelect !== "function") {
      return;
    }

    initChapterList(onChapterSelect, signal);
  },

  destroy() {},
};
