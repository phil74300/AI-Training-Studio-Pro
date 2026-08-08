import { cloneValue } from "./CommunicationRuntimeValue";

export class CommunicationRuntime {
  constructor(definition) {
    if (!definition?.id || !definition?.identity)
      throw new TypeError("CommunicationRuntime requires id and identity.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.identity = definition.identity;
    this.notificationRuleReferences = Object.freeze([
      ...(definition.notificationRuleReferences || []),
    ]);
    this.aiSuggestionPolicy = Object.freeze({
      output: "PROPOSAL_ONLY",
      humanValidationRequired: true,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
