let currentProject = null;

export function openProject(project) {
  currentProject = project;
}

export function getCurrentProject() {
  return currentProject;
}

export function closeProject() {
  currentProject = null;
}

export function hasProjectOpen() {
  return currentProject !== null;
}

export function getCurrentProjectChapters() {
  if (!currentProject) {
    return [];
  }

  if (!currentProject.chapters) {
    currentProject.chapters = [];
  }

  return currentProject.chapters;
}
