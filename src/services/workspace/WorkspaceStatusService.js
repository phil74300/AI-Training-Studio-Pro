import { createWorkspaceStatusSnapshot } from "./WorkspaceStatusSnapshot";

let snapshot = createWorkspaceStatusSnapshot();

const observers = new Set();

export function getWorkspaceStatusSnapshot() {
  return snapshot;
}

export function publishWorkspaceStatus(status) {
  snapshot = createWorkspaceStatusSnapshot(status);

  observers.forEach((observer) => observer(snapshot));
}

export function observeWorkspaceStatus(observer) {
  observers.add(observer);
  observer(snapshot);

  return () => observers.delete(observer);
}
