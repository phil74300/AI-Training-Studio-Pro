export const AIStatus = Object.freeze({
  IDLE: "IDLE",
  READY: "READY",
  WORKING: "WORKING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
});

const statusLabels = {
  [AIStatus.IDLE]: "IA inactive",
  [AIStatus.READY]: "IA prête",
  [AIStatus.WORKING]: "IA en cours",
  [AIStatus.SUCCESS]: "IA terminée",
  [AIStatus.ERROR]: "Erreur IA",
};

export function getAIStatusLabel(status) {
  return statusLabels[status] || statusLabels[AIStatus.IDLE];
}
