export async function loadProjects() {
  return await window.api.loadProjects();
}

export async function saveProjects(projects) {
  await window.api.saveProjects(projects);

  console.log(
    "💾 Sauvegarde automatique :",
    projects.length,
    "projet(s)"
  );

  return true;
}