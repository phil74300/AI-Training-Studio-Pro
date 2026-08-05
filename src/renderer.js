import "./index.css";

import { Sidebar } from "./components/Sidebar";
import { getPage } from "./services/Router";

const app = document.getElementById("app");

// Rend cette fonction accessible depuis les autres modules
window.navigate = render;

async function render(page = "dashboard") {

  const route = getPage(page);

  app.innerHTML = `
    <div class="app">
      ${Sidebar(page)}
      ${route.render()}
    </div>
  `;

  // Navigation de la sidebar
  document.querySelectorAll(".sidebar button").forEach((button) => {
    button.onclick = () => {
      render(button.dataset.page);
    };
  });

  // Initialisation de la page
  if (typeof route.init === "function") {
    await route.init();
  }

}

render("dashboard");

// Test IPC
window.api.ping().then(console.log);