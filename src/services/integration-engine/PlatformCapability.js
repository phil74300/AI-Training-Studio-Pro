import { IntegrationProviderId } from "./IntegrationProvider";
import { cloneValue } from "./IntegrationValue";

const providerIds = new Set(IntegrationProviderId);

export class PlatformCapability {
  constructor(definition) {
    if (!definition?.id || !providerIds.has(definition?.platformIdentity))
      throw new TypeError(
        "PlatformCapability requires id and a supported platformIdentity."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.platformIdentity = definition.platformIdentity;
    this.supportedOperations = Object.freeze([
      ...(definition.supportedOperations || []),
    ]);
    this.supportedFormats = Object.freeze([
      ...(definition.supportedFormats || []),
    ]);
    this.limitationsReference = definition.limitationsReference || null;
    this.versionReference = definition.versionReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
