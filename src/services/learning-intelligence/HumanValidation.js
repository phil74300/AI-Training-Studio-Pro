import { IntelligenceStatus } from "./IntelligenceStatus";
import { cloneValue, normalizeTimestamp } from "./IntelligenceValue";

const finalStates = new Set([
  IntelligenceStatus.ACCEPTED,
  IntelligenceStatus.REJECTED,
  IntelligenceStatus.MODIFIED,
]);

export class HumanValidation {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.proposalReference ||
      !definition?.validatorReference ||
      !finalStates.has(definition?.status) ||
      !definition?.validatedAt
    )
      throw new TypeError(
        "HumanValidation requires id, proposalReference, validatorReference, a final status, and validatedAt."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.proposalReference = definition.proposalReference;
    this.validatorReference = definition.validatorReference;
    this.status = definition.status;
    this.validatedAt = normalizeTimestamp(
      definition.validatedAt,
      "HumanValidation validatedAt"
    );
    this.rationale = definition.rationale || null;
    this.modificationReference = definition.modificationReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
