import {
  loadProjects,
  saveProjects
} from "./StorageService";

let projects = [];

/**
 * Charge les projets au démarrage
 */
export async function initProjectsStorage() {
  projects = await loadProjects();

  if (!Array.isArray(projects)) {
    projects = [];
  }
}

/**
 * Retourne tous les projets
 */
export function getProjects() {
  return projects;
}

/**
 * Crée un nouveau projet
 */
export async function createProject(name, type, description) {

  const project = {
    id: crypto.randomUUID(),
    name,
    type,
    description,
    createdAt: new Date().toLocaleString()
  };

  projects.push(project);

  await saveProjects(projects);

  return project;
}

/**
 * Supprime un projet
 */
export async function deleteProject(id) {

  projects = projects.filter(project => project.id !== id);

  await saveProjects(projects);

}

/**
 * Recherche un projet par son ID
 */
export function getProjectById(id) {
  return projects.find(project => project.id === id);
}

/**
 * Met à jour un projet
 */
export async function updateProject(updatedProject) {

  const index = projects.findIndex(
    project => project.id === updatedProject.id
  );

  if (index === -1) {
    return false;
  }

  projects[index] = updatedProject;

  await saveProjects(projects);

  return true;
}