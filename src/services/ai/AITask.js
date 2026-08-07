import { AIStatus } from "./AIStatus";

export function createAITask(actionId) {
  return {
    actionId,
    status: AIStatus.IDLE,
  };
}
