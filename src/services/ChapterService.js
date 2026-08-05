import { getCurrentProject } from "./WorkspaceService";
import { updateProject } from "./ProjectService";

let currentChapter = null;

function getChapterArray() {

  const project = getCurrentProject();

  if (!project) {
    return [];
  }

  if (!project.chapters) {
    project.chapters = [];
  }

  return project.chapters;

}

export function getChapters() {
  return getChapterArray();
}

export function getCurrentChapter() {
  return currentChapter;
}

export function selectChapter(id) {

  currentChapter =
    getChapterArray().find(
      chapter => chapter.id === id
    ) || null;

}

export async function createChapter(title) {

  const project = getCurrentProject();

  if (!project) {
    return null;
  }

  const chapter = {

    id: crypto.randomUUID(),

    title,

    content: "",

    createdAt: new Date().toLocaleString()

  };

  project.chapters.push(chapter);

  currentChapter = chapter;

  await updateProject(project);

  return chapter;

}

export async function renameChapter(id, title) {

  const chapter = getChapterArray().find(
    chapter => chapter.id === id
  );

  if (!chapter) {
    return;
  }

  chapter.title = title;

  await updateProject(
    getCurrentProject()
  );

}

export async function updateChapterContent(id, content) {

  const chapter = getChapterArray().find(
    chapter => chapter.id === id
  );

  if (!chapter) {
    return;
  }

  chapter.content = content;

  await updateProject(
    getCurrentProject()
  );

}

export async function deleteChapter(id) {

  const chapters = getChapterArray();

  const index = chapters.findIndex(
    chapter => chapter.id === id
  );

  if (index !== -1) {
    chapters.splice(index, 1);
  }

  if (currentChapter?.id === id) {
    currentChapter = chapters[0] || null;
  }

  await updateProject(
    getCurrentProject()
  );

}