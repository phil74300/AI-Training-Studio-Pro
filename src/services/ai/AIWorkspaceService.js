import { AIAvailability, isAIAvailability } from "./AIAvailability";

let state = {
  availability: AIAvailability.IDLE,
};

const observers = new Set();

export function getAIWorkspaceState() {
  return Object.freeze({
    availability: state.availability,
    status: state.availability,
  });
}

export function setAIWorkspaceAvailability(availability) {
  if (!isAIAvailability(availability)) {
    throw new Error("AIWorkspaceService : statut IA invalide.");
  }

  state = {
    availability,
  };

  observers.forEach((observer) => observer(getAIWorkspaceState()));
}

// Compatibility entry point while WorkspaceController migrates to the facade.
export function setAIWorkspaceStatus(status) {
  setAIWorkspaceAvailability(status);
}

export function initializeAIWorkspace() {
  setAIWorkspaceAvailability(AIAvailability.READY);
}

export function resetAIWorkspace() {
  setAIWorkspaceAvailability(AIAvailability.IDLE);
}

export function observeAIWorkspace(observer) {
  observers.add(observer);
  observer(getAIWorkspaceState());

  return () => observers.delete(observer);
}
