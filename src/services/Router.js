import { Dashboard } from "../pages/Dashboard";
import { Projects, initProjects } from "../pages/Projects";
import { Workspace, destroyWorkspace, initWorkspace } from "../pages/Workspace";
import { Books } from "../pages/books";
import { Training } from "../pages/training";
import { Images } from "../pages/images";
import { Exports } from "../pages/exports";
import { Settings } from "../pages/settings";

const routes = {
  dashboard: {
    render: Dashboard,
  },

  projects: {
    render: Projects,
    init: initProjects,
  },

  workspace: {
    render: Workspace,
    init: initWorkspace,
    destroy: destroyWorkspace,
  },

  books: {
    render: Books,
  },

  training: {
    render: Training,
  },

  images: {
    render: Images,
  },

  exports: {
    render: Exports,
  },

  settings: {
    render: Settings,
  },
};

export function getPage(page) {
  return routes[page] || routes.dashboard;
}
