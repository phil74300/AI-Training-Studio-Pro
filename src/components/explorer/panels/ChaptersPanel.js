import { ChapterList, initChapterList } from "../../ChapterList";
import {
  ChapterContextMenu,
  destroyChapterContextMenu,
  initChapterContextMenu,
} from "../../ChapterContextMenu";

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

        <div class="explorer-chapter-list">

          ${ChapterList()}

        </div>

        ${ChapterContextMenu()}

      </div>

    `;
  },

  mount({ onChapterChange, onChapterSelect, signal } = {}) {
    if (typeof onChapterSelect === "function") {
      initChapterList(onChapterSelect, signal);
    }

    initChapterContextMenu({ onChange: onChapterChange, signal });
  },

  destroy() {
    destroyChapterContextMenu();
  },
};
