import { AIStatus } from "./AIStatus";

let state = {
  status: AIStatus.IDLE,
  task: null,
};

const observers = new Set();

export function getAIWorkspaceState() {
  return { ...state };
}

export function setAIWorkspaceStatus(status, task = null) {
  if (!Object.values(AIStatus).includes(status)) {
    throw new Error("AIWorkspaceService : statut IA invalide.");
  }

  state = {
    status,
    task,
  };

  observers.forEach((observer) => observer(getAIWorkspaceState()));
}

export function initializeAIWorkspace() {
  setAIWorkspaceStatus(AIStatus.READY);
}

export function resetAIWorkspace() {
  setAIWorkspaceStatus(AIStatus.IDLE);
}

export function observeAIWorkspace(observer) {
  observers.add(observer);
  observer(getAIWorkspaceState());

  return () => observers.delete(observer);
}
