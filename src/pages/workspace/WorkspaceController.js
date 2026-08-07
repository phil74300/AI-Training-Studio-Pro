import { ChapterList, initChapterList } from "../../components/ChapterList";
import { ChapterModal, initChapterModal } from "../../components/ChapterModal";
import {
  ChapterEditor,
  destroyChapterEditor,
  initChapterEditor,
} from "../../components/ChapterEditor";
import { WorkspaceLayout } from "../../components/layout/WorkspaceLayout";
import { initRibbon } from "../../components/layout/RibbonController";
import { getCurrentProject } from "../../services/WorkspaceService";

export class WorkspaceController {
  abortController = null;

  editorFrame = null;

  render() {
    const project = getCurrentProject();

    if (!project) {
      return `

            <div class="workspace-empty">

                <h1>Aucun projet ouvert</h1>

                <p>

                    Ouvrez un projet.

                </p>

            </div>

        `;
    }

    const content = `

        <div class="workspace-editor">

            <div class="workspace-toolbar">

                <button
                    id="newChapter"
                    class="primary-button">

                    ➕ Nouveau chapitre

                </button>

            </div>

            ${ChapterList()}

            <hr class="workspace-separator">

            ${ChapterEditor()}

        </div>

    `;

    return `

        ${WorkspaceLayout(content)}

        ${ChapterModal()}

    `;
  }

  mount() {
    this.destroy();

    this.abortController = new AbortController();

    this.registerEvents(this.abortController.signal);

    this.editorFrame = requestAnimationFrame(() => {
      this.editorFrame = null;

      if (
        this.abortController?.signal.aborted ||
        !document.getElementById("editor")
      ) {
        return;
      }

      initChapterEditor(this.abortController.signal);
      initRibbon(this.abortController.signal);
    });
  }

  destroy() {
    if (this.editorFrame !== null) {
      cancelAnimationFrame(this.editorFrame);
      this.editorFrame = null;
    }

    this.abortController?.abort();
    this.abortController = null;

    destroyChapterEditor();
  }

  registerEvents(signal) {
    const renderWorkspace = () => window.navigate("workspace");

    initChapterList(renderWorkspace, signal);
    initChapterModal(renderWorkspace, signal);
  }
}

export const workspaceController = new WorkspaceController();
