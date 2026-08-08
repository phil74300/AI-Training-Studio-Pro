import { ChangeRequestStatus } from "./ChangeRequestStatus";
import { cloneValue } from "./WorkflowValue";

const statuses = new Set(Object.values(ChangeRequestStatus));

export class ChangeRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.sourceReference ||
      !definition?.requesterReference ||
      !definition?.description
    )
      throw new TypeError(
        "ChangeRequest requires id, sourceReference, requesterReference, and description."
      );
    const status = definition.status || ChangeRequestStatus.OPEN;
    if (!statuses.has(status))
      throw new TypeError("ChangeRequest requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.sourceReference = definition.sourceReference;
    this.requesterReference = definition.requesterReference;
    this.description = definition.description;
    this.priority = definition.priority || "medium";
    this.status = status;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
