import {
  loadProjects,
  saveProjects
} from "./StorageService";

let projects = [];

/**
 * Chargement des projets
 */
export async function initProjectsStorage() {

  projects = await loadProjects();

  if (!Array.isArray(projects)) {
    projects = [];
  }

  // Migration automatique des anciens projets
  projects.forEach(project => {

    if (!project.chapters) {
      project.chapters = [];
    }

  });

}

/**
 * Retourne tous les projets
 */
export function getProjects() {
  return projects;
}

/**
 * Recherche par ID
 */
export function getProjectById(id) {

  return projects.find(
    project => project.id === id
  );

}

/**
 * Création
 */
export async function createProject(
  name,
  type,
  description
) {

  const project = {

    id: crypto.randomUUID(),

    name,

    type,

    description,

    chapters: [],

    createdAt: new Date().toLocaleString()

  };

  projects.push(project);

  await saveProjects(projects);

  return project;

}

/**
 * Mise à jour
 */
export async function updateProject(project) {

  const index = projects.findIndex(
    p => p.id === project.id
  );

  if (index === -1) {
    return false;
  }

  projects[index] = project;

  await saveProjects(projects);

  return true;

}

/**
 * Suppression
 */
export async function deleteProject(id) {

  projects = projects.filter(
    project => project.id !== id
  );

  await saveProjects(projects);

}