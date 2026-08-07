import { ChapterModal, initChapterModal } from "../../components/ChapterModal";
import {
  ChapterEditor,
  destroyChapterEditor,
  initChapterEditor,
} from "../../components/ChapterEditor";
import { WorkspaceLayout } from "../../components/layout/WorkspaceLayout";
import { initRibbon } from "../../components/layout/RibbonController";
import {
  destroyWorkspaceSidebar,
  initWorkspaceSidebar,
} from "../../components/layout/WorkspaceSidebar";
import { resetExplorerPanels } from "../../components/explorer/ExplorerPanelRegistry";
import {
  clearCurrentChapter,
  getCurrentChapter,
  selectChapter as selectCurrentChapter,
} from "../../services/ChapterService";
import {
  closeProject as closeCurrentProject,
  getCurrentProject,
  openProject as openCurrentProject,
} from "../../services/WorkspaceService";

export class WorkspaceController {
  abortController = null;

  editorFrame = null;

  session = {
    projectId: null,
    chapterId: null,
  };

  render() {
    const project = getCurrentProject();

    this.ensureSession(project);

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

    this.ensureSession(getCurrentProject());

    this.abortController = new AbortController();

    this.registerEvents(this.abortController.signal);
    initWorkspaceSidebar(this.abortController.signal, {
      onChapterChange: () => this.refreshSession(),
      onChapterSelect: (chapterId) => this.selectChapter(chapterId),
    });

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

    destroyWorkspaceSidebar();
    destroyChapterEditor();
  }

  openProject(project) {
    if (!project?.id) {
      return;
    }

    this.reset();

    openCurrentProject(project);

    this.session.projectId = project.id;
  }

  closeProject() {
    this.reset();

    closeCurrentProject();
  }

  reset() {
    this.destroy();
    resetExplorerPanels();
    clearCurrentChapter();

    this.session.projectId = null;
    this.session.chapterId = null;
  }

  registerEvents(signal) {
    initChapterModal(() => this.refreshSession(), signal);
  }

  selectChapter(chapterId) {
    if (
      this.session.chapterId === chapterId &&
      getCurrentChapter()?.id === chapterId
    ) {
      return;
    }

    selectCurrentChapter(chapterId);

    this.syncChapterSelection();

    if (this.session.chapterId !== chapterId) {
      return;
    }

    this.renderWorkspace();
  }

  refreshSession() {
    this.syncChapterSelection();
    this.renderWorkspace();
  }

  ensureSession(project) {
    if (!project) {
      clearCurrentChapter();

      this.session.projectId = null;
      this.session.chapterId = null;

      return;
    }

    if (this.session.projectId !== project.id) {
      clearCurrentChapter();

      this.session.projectId = project.id;
      this.session.chapterId = null;

      return;
    }

    this.syncChapterSelection();
  }

  syncChapterSelection() {
    const project = getCurrentProject();
    const chapter = getCurrentChapter();

    const chapterBelongsToProject = project?.chapters?.some(
      (item) => item.id === chapter?.id
    );

    if (!chapterBelongsToProject) {
      clearCurrentChapter();
      this.session.chapterId = null;

      return;
    }

    this.session.chapterId = chapter.id;
  }

  renderWorkspace() {
    window.navigate("workspace");
  }
}

export const workspaceController = new WorkspaceController();
