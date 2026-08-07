import { getCurrentProject } from "./WorkspaceService";

import { updateProject } from "./ProjectService";

let currentChapter = null;

/**
 * Retourne le tableau des chapitres.
 */
function getChapterArray() {
  const project = getCurrentProject();

  if (!project) {
    return [];
  }

  if (!Array.isArray(project.chapters)) {
    project.chapters = [];
  }

  return project.chapters;
}

/**
 * Tous les chapitres.
 */
export function getChapters() {
  return getChapterArray();
}

/**
 * Chapitre courant.
 */
export function getCurrentChapter() {
  return currentChapter;
}

/**
 * Sélection d'un chapitre.
 */
export function selectChapter(id) {
  currentChapter =
    getChapterArray().find((chapter) => chapter.id === id) || null;
}

/**
 * Création.
 */
export async function createChapter(title) {
  const project = getCurrentProject();

  if (!project) {
    return null;
  }

  const chapter = {
    id: crypto.randomUUID(),

    title,

    content: "",

    createdAt: new Date().toLocaleString(),
  };

  project.chapters.push(chapter);

  currentChapter = chapter;

  await updateProject(project);

  return chapter;
}

/**
 * Renommer.
 */
export async function renameChapter(id, title) {
  const chapter = getChapterArray().find((c) => c.id === id);

  if (!chapter) return;

  chapter.title = title;

  await updateProject(getCurrentProject());
}

/**
 * Modifier le contenu.
 */
export async function updateChapterContent(id, content) {
  console.log("💾 Sauvegarde chapitre :", id);

  const chapter = getChapterArray().find((c) => c.id === id);

  if (!chapter) return;

  chapter.content = content;

  await updateProject(getCurrentProject());
}

/**
 * Suppression.
 */
export async function deleteChapter(id) {
  const chapters = getChapterArray();

  const index = chapters.findIndex((c) => c.id === id);

  if (index >= 0) {
    chapters.splice(index, 1);
  }

  if (currentChapter?.id === id) {
    currentChapter = chapters[0] || null;
  }

  await updateProject(getCurrentProject());
}
