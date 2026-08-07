import { AIAvailability, getAIAvailabilityLabel } from "./AIAvailability";

// Compatibility alias for the current Workspace UI projection.
export const AIStatus = AIAvailability;

export function getAIStatusLabel(status) {
  return getAIAvailabilityLabel(status);
}
