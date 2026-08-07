import {
  deleteChapter,
  getChapters,
  renameChapter,
} from "../services/ChapterService";

let chapterId = null;

export function ChapterContextMenu() {
  return `

    <div
      id="chapterContextMenu"
      class="chapter-context-menu hidden"
      role="menu">

      <button
        type="button"
        data-action="rename"
        role="menuitem">

        Renommer

      </button>

      <button
        type="button"
        data-action="delete"
        role="menuitem">

        Supprimer

      </button>

    </div>

  `;
}

export function initChapterContextMenu({ onChange, signal } = {}) {
  const menu = document.getElementById("chapterContextMenu");

  if (!menu) {
    return;
  }

  document.querySelectorAll(".chapter-card").forEach((card) => {
    card.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();

        chapterId = card.dataset.id;

        openChapterContextMenu(menu, event.clientX, event.clientY);
      },
      { signal }
    );
  });

  menu.addEventListener(
    "click",
    async (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;

      if (!action || !chapterId) {
        return;
      }

      const selectedChapterId = chapterId;

      closeChapterContextMenu();

      if (action === "rename") {
        const chapter = getChapters().find(
          (item) => item.id === selectedChapterId
        );
        const title = window.prompt("Renommer le chapitre", chapter?.title);

        if (title === null) {
          return;
        }

        await renameChapter(selectedChapterId, title);
      }

      if (action === "delete") {
        await deleteChapter(selectedChapterId);
      }

      onChange?.();
    },
    { signal }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (!menu.contains(event.target)) {
        closeChapterContextMenu();
      }
    },
    { signal }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeChapterContextMenu();
      }
    },
    { signal }
  );
}

export function destroyChapterContextMenu() {
  closeChapterContextMenu();
}

function openChapterContextMenu(menu, x, y) {
  menu.classList.remove("hidden");

  const maxX = window.innerWidth - menu.offsetWidth - 8;
  const maxY = window.innerHeight - menu.offsetHeight - 8;

  menu.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
}

function closeChapterContextMenu() {
  const menu = document.getElementById("chapterContextMenu");

  if (menu) {
    menu.classList.add("hidden");
  }

  chapterId = null;
}
