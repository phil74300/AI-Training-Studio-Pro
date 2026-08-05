import { Dashboard } from "../pages/Dashboard";
import { Projects, initProjects } from "../pages/Projects";
import { Books } from "../pages/Books";
import { Training } from "../pages/Training";
import { Images } from "../pages/Images";
import { Exports } from "../pages/Exports";
import { Settings } from "../pages/Settings";

const routes = {
  dashboard: {
    render: Dashboard
  },

  projects: {
    render: Projects,
    init: initProjects
  },

  books: {
    render: Books
  },

  training: {
    render: Training
  },

  images: {
    render: Images
  },

  exports: {
    render: Exports
  },

  settings: {
    render: Settings
  }
};

export function getPage(page) {
  return routes[page] || routes.dashboard;
}