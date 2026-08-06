import "./index.css";

import { Sidebar } from "./components/Sidebar";
import { getPage } from "./services/Router";

const app = document.getElementById("app");

// Navigation globale
window.navigate = render;

async function render(page = "dashboard") {

  const route = getPage(page);

  app.innerHTML = `

    <div class="app">

      ${Sidebar(page)}

      ${route.render()}

    </div>

  `;

  document
    .querySelectorAll(".sidebar button")
    .forEach(button => {

      button.onclick = () => {

        render(button.dataset.page);

      };

    });

  if (typeof route.init === "function") {

    await route.init();

  }

}

// Démarrage
render("dashboard");

// Test IPC
window.api
  .ping()
  .then(console.log);