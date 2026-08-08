import { SecurityProposalStatus } from "./SecurityProposalStatus";

const proposalStatuses = new Set(Object.values(SecurityProposalStatus));

export class AuditRecord {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.securityEventReference ||
      !definition?.actorReference ||
      !definition?.timestamp ||
      !definition?.targetReference
    )
      throw new TypeError(
        "AuditRecord requires id, securityEventReference, actorReference, timestamp, and targetReference."
      );
    const timestamp = new Date(definition.timestamp);
    if (Number.isNaN(timestamp.getTime()))
      throw new TypeError("AuditRecord requires a valid timestamp.");
    const proposalStatus =
      definition.aiSuggestion?.status || SecurityProposalStatus.PROPOSAL_ONLY;
    if (!proposalStatuses.has(proposalStatus))
      throw new TypeError(
        "AuditRecord requires a supported AI proposal status."
      );
    if (
      definition.aiSuggestion?.confidence !== undefined &&
      (typeof definition.aiSuggestion.confidence !== "number" ||
        definition.aiSuggestion.confidence < 0 ||
        definition.aiSuggestion.confidence > 1)
    )
      throw new TypeError(
        "AuditRecord AI suggestion confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.securityEventReference = definition.securityEventReference;
    this.actorReference = definition.actorReference;
    this.timestamp = timestamp.toISOString();
    this.targetReference = definition.targetReference;
    this.aiSuggestion = Object.freeze({
      anomalyDetectionReference:
        definition.aiSuggestion?.anomalyDetectionReference || null,
      unusualActivityReference:
        definition.aiSuggestion?.unusualActivityReference || null,
      securityRecommendationReference:
        definition.aiSuggestion?.securityRecommendationReference || null,
      confidence: definition.aiSuggestion?.confidence ?? null,
      status: proposalStatus,
    });
    this.validationState =
      definition.validationState || "PENDING_HUMAN_SECURITY_VALIDATION";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
