import { IntegrationProviderId } from "./IntegrationProvider";
import { cloneValue } from "./IntegrationValue";

const providerIds = new Set(IntegrationProviderId);
const operations = new Set([
  "CONNECT",
  "VALIDATE",
  "IMPORT",
  "EXPORT",
  "SYNCHRONIZE",
  "DISCONNECT",
]);

export class IntegrationAdapter {
  constructor(definition) {
    if (!definition?.id || !providerIds.has(definition?.provider))
      throw new TypeError(
        "IntegrationAdapter requires id and a supported provider."
      );
    const supportedOperations = definition.supportedOperations || [];
    if (supportedOperations.some((operation) => !operations.has(operation)))
      throw new TypeError("IntegrationAdapter requires supported operations.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.provider = definition.provider;
    this.supportedOperations = Object.freeze([...supportedOperations]);
    this.capabilityReferences = Object.freeze([
      ...(definition.capabilityReferences || []),
    ]);
    this.authenticationDescriptorReference =
      definition.authenticationDescriptorReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
