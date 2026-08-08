import { cloneValue } from "./CommunicationRuntimeValue";

export class CommunicationPreference {
  constructor(definition) {
    if (!definition?.id || !definition?.recipientReference)
      throw new TypeError(
        "CommunicationPreference requires id and recipientReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.recipientReference = definition.recipientReference;
    this.channelReferences = Object.freeze([
      ...(definition.channelReferences || []),
    ]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
