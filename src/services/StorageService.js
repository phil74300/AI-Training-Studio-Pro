export async function loadProjects() {
  return await window.api.loadProjects();
}

export async function saveProjects(projects) {
  return await window.api.saveProjects(projects);
}