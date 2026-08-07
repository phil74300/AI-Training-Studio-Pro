import { workspaceController } from "./workspace/WorkspaceController";

export function Workspace() {
  return workspaceController.render();
}

export function initWorkspace() {
  workspaceController.mount();
}

export function destroyWorkspace() {
  workspaceController.destroy();
}

export function openWorkspaceProject(project) {
  workspaceController.openProject(project);
}

export function closeWorkspaceProject() {
  workspaceController.closeProject();
}
