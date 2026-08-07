import { ChapterModal, initChapterModal } from "../../components/ChapterModal";
import {
  ChapterEditor,
  destroyChapterEditor,
  initChapterEditor,
} from "../../components/ChapterEditor";
import { WorkspaceLayout } from "../../components/layout/WorkspaceLayout";
import { destroyAIPanel, initAIPanel } from "../../components/layout/AIPanel";
import { initRibbon } from "../../components/layout/RibbonController";
import {
  destroyStatusBar,
  initStatusBar,
} from "../../components/layout/StatusBar";
import {
  destroyWorkspaceSidebar,
  initWorkspaceSidebar,
} from "../../components/layout/WorkspaceSidebar";
import { resetExplorerPanels } from "../../components/explorer/ExplorerPanelRegistry";
import {
  getAIWorkspaceState,
  initializeAIWorkspace,
  observeAIWorkspace,
  resetAIWorkspace,
} from "../../services/ai/AIWorkspaceService";
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
import { WorkspaceStatus } from "../../services/workspace/WorkspaceStatus";
import { publishWorkspaceStatus } from "../../services/workspace/WorkspaceStatusService";

export class WorkspaceController {
  abortController = null;

  editorFrame = null;

  statusCleanup = null;

  workspaceReadyState = WorkspaceStatus.IDLE;

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

    initializeAIWorkspace();
    this.mountWorkspaceStatus(this.abortController.signal);

    this.registerEvents(this.abortController.signal);
    initWorkspaceSidebar(this.abortController.signal, {
      onChapterChange: () => this.refreshSession(),
      onChapterSelect: (chapterId) => this.selectChapter(chapterId),
    });
    initAIPanel(this.abortController.signal);
    initStatusBar(this.abortController.signal);

    this.editorFrame = requestAnimationFrame(() => {
      this.editorFrame = null;

      if (
        this.abortController?.signal.aborted ||
        !document.getElementById("editor")
      ) {
        return;
      }

      initChapterEditor(this.abortController.signal, {
        onChapterChange: () => this.publishWorkspaceStatus(),
      });
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

    this.destroyWorkspaceStatus();
    destroyAIPanel();
    destroyStatusBar();
    destroyWorkspaceSidebar();
    destroyChapterEditor();

    resetAIWorkspace();
    this.publishWorkspaceStatus();
  }

  openProject(project) {
    if (!project?.id) {
      return;
    }

    this.reset();

    openCurrentProject(project);

    this.session.projectId = project.id;
    this.publishWorkspaceStatus();
  }

  closeProject() {
    this.reset();

    closeCurrentProject();
    this.publishWorkspaceStatus();
  }

  reset() {
    this.destroy();
    resetExplorerPanels();
    clearCurrentChapter();

    this.session.projectId = null;
    this.session.chapterId = null;

    this.publishWorkspaceStatus();
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

    this.publishWorkspaceStatus();
    this.renderWorkspace();
  }

  refreshSession() {
    this.syncChapterSelection();
    this.publishWorkspaceStatus();
    this.renderWorkspace();
  }

  ensureSession(project) {
    if (!project) {
      clearCurrentChapter();

      this.session.projectId = null;
      this.session.chapterId = null;

      this.publishWorkspaceStatus();

      return;
    }

    if (this.session.projectId !== project.id) {
      clearCurrentChapter();

      this.session.projectId = project.id;
      this.session.chapterId = null;

      this.publishWorkspaceStatus();

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

      this.publishWorkspaceStatus();

      return;
    }

    this.session.chapterId = chapter.id;
    this.publishWorkspaceStatus();
  }

  mountWorkspaceStatus(signal) {
    this.destroyWorkspaceStatus();

    this.workspaceReadyState = WorkspaceStatus.READY;

    this.statusCleanup = observeAIWorkspace(() => {
      this.publishWorkspaceStatus();
    });

    signal?.addEventListener("abort", () => this.destroyWorkspaceStatus(), {
      once: true,
    });
  }

  destroyWorkspaceStatus() {
    if (
      !this.statusCleanup &&
      this.workspaceReadyState === WorkspaceStatus.IDLE
    ) {
      return;
    }

    this.statusCleanup?.();
    this.statusCleanup = null;

    this.workspaceReadyState = WorkspaceStatus.IDLE;
    this.publishWorkspaceStatus();
  }

  publishWorkspaceStatus() {
    const project = getCurrentProject();
    const chapter = getCurrentChapter();
    const { status: aiStatus } = getAIWorkspaceState();

    publishWorkspaceStatus({
      activeProject: project,
      activeChapter: chapter,
      chapterCount: project?.chapters?.length || 0,
      saveStatus: "Sauvegarde automatique",
      aiStatus,
      readyState: this.workspaceReadyState,
    });
  }

  renderWorkspace() {
    window.navigate("workspace");
  }
}

export const workspaceController = new WorkspaceController();
