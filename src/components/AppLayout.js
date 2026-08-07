import { Sidebar } from "./Sidebar";

export function AppLayout({
    page = "",
    active = "dashboard"
}) {

    return `

        <div class="app-layout">

            <aside class="app-sidebar">

                ${Sidebar(active)}

            </aside>

            <section class="app-shell">

                <main class="app-main">

                    ${page}

                </main>

            </section>

        </div>

    `;

}