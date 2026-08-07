import { AIStatus } from "../ai/AIStatus";
import { APPLICATION_VERSION, WorkspaceStatus } from "./WorkspaceStatus";

const createEntity = (entity, fields) => {
  if (!entity) {
    return null;
  }

  return Object.freeze(
    fields.reduce(
      (snapshot, field) => ({
        ...snapshot,
        [field]: entity[field] || "",
      }),
      {}
    )
  );
};

export function createWorkspaceStatusSnapshot({
  activeProject = null,
  activeChapter = null,
  chapterCount = 0,
  saveStatus = "Sauvegarde automatique",
  aiStatus = AIStatus.IDLE,
  applicationVersion = APPLICATION_VERSION,
  readyState = WorkspaceStatus.IDLE,
} = {}) {
  return Object.freeze({
    activeProject: createEntity(activeProject, ["id", "name"]),
    activeChapter: createEntity(activeChapter, ["id", "title"]),
    chapterCount,
    saveStatus,
    aiStatus,
    applicationVersion,
    readyState,
  });
}
