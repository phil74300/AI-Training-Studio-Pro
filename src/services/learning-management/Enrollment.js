import { CompletionStatus } from "./CompletionStatus";
export class Enrollment {
  constructor(value) {
    if (!value?.id || !value?.learnerId || !value?.sessionId)
      throw new TypeError("Enrollment requires id, learnerId, and sessionId.");
    if (
      !Object.values(CompletionStatus).includes(
        value.status || CompletionStatus.REGISTERED
      )
    )
      throw new TypeError("Enrollment has unsupported status.");
    this.schemaVersion = 1;
    this.id = value.id;
    this.learnerId = value.learnerId;
    this.sessionId = value.sessionId;
    this.status = value.status || CompletionStatus.REGISTERED;
    this.createdAt = new Date(value.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
