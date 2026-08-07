export const AIAvailability = Object.freeze({
  IDLE: "IDLE",
  READY: "READY",
  BUSY: "BUSY",
  DEGRADED: "DEGRADED",
  UNAVAILABLE: "UNAVAILABLE",
});

const availabilityLabels = Object.freeze({
  [AIAvailability.IDLE]: "IA inactive",
  [AIAvailability.READY]: "IA prête",
  [AIAvailability.BUSY]: "IA en cours",
  [AIAvailability.DEGRADED]: "IA dégradée",
  [AIAvailability.UNAVAILABLE]: "IA indisponible",
});

export function isAIAvailability(value) {
  return Object.values(AIAvailability).includes(value);
}

export function getAIAvailabilityLabel(availability) {
  return (
    availabilityLabels[availability] || availabilityLabels[AIAvailability.IDLE]
  );
}
