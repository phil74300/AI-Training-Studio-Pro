import { IntegrationProviderId } from "./IntegrationProvider";
import { IntegrationStatus } from "./IntegrationStatus";
import { cloneValue } from "./IntegrationValue";

const providerIds = new Set(IntegrationProviderId);
const statuses = new Set(Object.values(IntegrationStatus));

export class IntegrationDefinition {
  constructor(definition) {
    if (!definition?.id || !providerIds.has(definition?.provider))
      throw new TypeError(
        "IntegrationDefinition requires id and a supported provider."
      );
    const status = definition.status || IntegrationStatus.DRAFT;
    if (!statuses.has(status))
      throw new TypeError("IntegrationDefinition requires a supported status.");
    if (
      definition.aiSuggestion?.confidence !== undefined &&
      (typeof definition.aiSuggestion.confidence !== "number" ||
        definition.aiSuggestion.confidence < 0 ||
        definition.aiSuggestion.confidence > 1)
    )
      throw new TypeError(
        "IntegrationDefinition AI suggestion confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.provider = definition.provider;
    this.title = definition.title || null;
    this.adapterReference = definition.adapterReference || null;
    this.capabilityReferences = Object.freeze([
      ...(definition.capabilityReferences || []),
    ]);
    this.authenticationDescriptorReference =
      definition.authenticationDescriptorReference || null;
    this.tenantScopeReference = definition.tenantScopeReference || null;
    this.consentReference = definition.consentReference || null;
    this.status = status;
    this.aiSuggestion = cloneValue({
      platformChoiceReferences:
        definition.aiSuggestion?.platformChoiceReferences || [],
      exportFormatReferences:
        definition.aiSuggestion?.exportFormatReferences || [],
      compatibilityAnalysisReferences:
        definition.aiSuggestion?.compatibilityAnalysisReferences || [],
      confidence: definition.aiSuggestion?.confidence ?? null,
      status: "PROPOSAL_ONLY",
      validationState: "PENDING_HUMAN_VALIDATION",
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
