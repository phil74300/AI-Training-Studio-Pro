import { Header } from "../components/Header";
import { ProjectModal } from "../components/ProjectModal";
import { openProject } from "../services/WorkspaceService";

import {
  initProjectsStorage,
  getProjects,
  createProject,
  deleteProject,
} from "../services/ProjectService";

export function Projects() {
  return `
    <main class="content">

      ${Header("Projets")}

      <div class="projects-toolbar">
        <button id="newProject" class="primary-button">
          ➕ Nouveau projet
        </button>
      </div>

      <div id="projectList" class="project-list"></div>

      ${ProjectModal()}

    </main>
  `;
}

export async function initProjects() {
  await initProjectsStorage();

  const modal = document.getElementById("projectModal");
  const list = document.getElementById("projectList");

  function refreshProjects() {
    const projects = getProjects();

    if (projects.length === 0) {
      list.innerHTML = `
        <div class="project-card">

          <div class="project-icon">📁</div>

          <div class="project-info">
            <h3>Aucun projet</h3>
            <p>Cliquez sur <strong>Nouveau projet</strong> pour commencer.</p>
          </div>

        </div>
      `;

      return;
    }

    list.innerHTML = "";

    projects.forEach((project) => {
      list.innerHTML += `
        <div class="project-card" data-id="${project.id}">

          <div class="project-icon">
            📁
          </div>

          <div class="project-info">
            <h3>${project.name}</h3>
            <p>${project.type}</p>
            <small>${project.createdAt}</small>
          </div>

          <button
            class="delete-button"
            data-id="${project.id}">
            🗑️
          </button>

        </div>
      `;
    });

    // Suppression
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.onclick = async (event) => {
        event.stopPropagation();

        await deleteProject(button.dataset.id);

        refreshProjects();
      };
    });

    // Ouverture du projet
    document.querySelectorAll(".project-card").forEach((card) => {
      card.onclick = () => {
        const project = getProjects().find((p) => p.id === card.dataset.id);

        if (!project) return;

        console.log("Projet ouvert :", project);

        openProject(project);

        window.navigate("workspace");
      };
    });
  }

  document.getElementById("newProject").onclick = () => {
    modal.classList.remove("hidden");
  };

  document.getElementById("cancelProject").onclick = () => {
    modal.classList.add("hidden");
  };

  document.getElementById("createProject").onclick = async () => {
    const name = document.getElementById("projectName").value.trim();
    const type = document.getElementById("projectType").value;
    const description = document.getElementById("projectDescription").value;

    if (!name) {
      alert("Le nom du projet est obligatoire.");
      return;
    }

    await createProject(name, type, description);

    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";
    document.getElementById("projectType").selectedIndex = 0;

    modal.classList.add("hidden");

    refreshProjects();
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.classList.add("hidden");
    }
  });

  modal.onclick = (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  };

  refreshProjects();
}
