import { Ribbon } from "./Ribbon";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { AIPanel } from "./AIPanel";
import { StatusBar } from "./StatusBar";

export function WorkspaceLayout(content = "") {

    return `

        <section class="workspace-layout">

            <header class="layout-header">

                ${Ribbon()}

            </header>

            <section class="layout-body">

                <aside class="layout-sidebar">

                    ${WorkspaceSidebar()}

                </aside>

                <main class="layout-editor">

                    ${content}

                </main>

                <aside class="layout-ai">

                    ${AIPanel()}

                </aside>

            </section>

            <footer class="layout-footer">

                ${StatusBar()}

            </footer>

        </section>

    `;

}