import "./index.css";

import { Sidebar } from "./components/sidebar";
import { getPage } from "./services/Router";

const app = document.getElementById("app");

let activeRoute = null;

// Navigation globale
window.navigate = render;

async function render(page = "dashboard") {
  activeRoute?.destroy?.();

  const route = getPage(page);

  app.innerHTML = `

    <div class="app">

      ${Sidebar(page)}

      ${route.render()}

    </div>

  `;

  document.querySelectorAll(".sidebar button").forEach((button) => {
    button.onclick = () => {
      render(button.dataset.page);
    };
  });

  if (typeof route.init === "function") {
    await route.init();
  }

  activeRoute = route;
}

// Démarrage
render("dashboard");

// Test IPC
window.api.ping().then(console.log);
