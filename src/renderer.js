import "./index.css";

import { AppLayout } from "./components/AppLayout";
import { getPage } from "./services/Router";

const app = document.getElementById("app");

/* ==========================================================
   NAVIGATION GLOBALE
========================================================== */

window.navigate = navigate;

/* ==========================================================
   RENDER
========================================================== */

async function navigate(page = "dashboard") {

    const route = getPage(page);

    if (!route) {

        console.error(
            "Route inconnue :",
            page
        );

        return;

    }

    app.innerHTML = AppLayout({

        active: page,

        page: route.render()

    });

    bindNavigation();

    if (typeof route.init === "function") {

        try {

            await route.init();

        }

        catch (error) {

            console.error(error);

        }

    }

}

/* ==========================================================
   SIDEBAR
========================================================== */

function bindNavigation() {

    document
        .querySelectorAll(".sidebar-item")
        .forEach(button => {

            button.onclick = () => {

                const page =
                    button.dataset.page;

                if (!page) {

                    return;

                }

                navigate(page);

            };

        });

}

/* ==========================================================
   START
========================================================== */

navigate();

/* ==========================================================
   IPC TEST
========================================================== */

if (window.api?.ping) {

    window.api
        .ping()
        .then(console.log)
        .catch(console.error);

}