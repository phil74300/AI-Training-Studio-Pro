import { ImprovementActionStatus } from "./ImprovementActionStatus";

const statuses = new Set(Object.values(ImprovementActionStatus));

export class ImprovementAction {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.qualityFindingId ||
      !definition?.description ||
      !definition?.responsibleReference ||
      !definition?.createdAt
    )
      throw new TypeError(
        "ImprovementAction requires id, qualityFindingId, description, responsibleReference, and createdAt."
      );
    const status = definition.status || ImprovementActionStatus.OPEN;
    if (!statuses.has(status))
      throw new TypeError("ImprovementAction requires a supported status.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.qualityFindingId = definition.qualityFindingId;
    this.description = definition.description;
    this.priority = definition.priority || "medium";
    this.responsibleReference = definition.responsibleReference;
    this.status = status;
    this.createdAt = new Date(definition.createdAt).toISOString();
    this.completedAt = definition.completedAt
      ? new Date(definition.completedAt).toISOString()
      : null;
    this.evidenceReferences = Object.freeze([
      ...(definition.evidenceReferences || []),
    ]);
    this.trainingVersion = definition.trainingVersion || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
