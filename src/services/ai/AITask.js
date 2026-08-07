import { AITaskStatus } from "./AITaskStatus";

export function createAITask(actionId) {
  return {
    actionId,
    status: AITaskStatus.CREATED,
  };
}
