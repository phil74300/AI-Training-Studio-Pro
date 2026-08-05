/**
 * Charge les projets depuis Electron.
 */
export async function loadProjects() {

  try {

    const projects = await window.api.loadProjects();

    return Array.isArray(projects)
      ? projects
      : [];

  } catch (error) {

    console.error(
      "Erreur de chargement des projets :",
      error
    );

    return [];

  }

}

/**
 * Sauvegarde les projets.
 */
export async function saveProjects(projects) {

  try {

    await window.api.saveProjects(projects);

    console.log(
      "💾 Sauvegarde automatique :",
      projects.length,
      "projet(s)"
    );

    return true;

  } catch (error) {

    console.error(
      "Erreur de sauvegarde :",
      error
    );

    return false;

  }

}