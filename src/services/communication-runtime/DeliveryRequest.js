import { cloneValue } from "./CommunicationRuntimeValue";
import { DeliveryChannel } from "./DeliveryChannel";

const channels = new Set(Object.values(DeliveryChannel));

export class DeliveryRequest {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.communicationMessageReference ||
      !channels.has(definition?.channel)
    )
      throw new TypeError(
        "DeliveryRequest requires id, communicationMessageReference, and a supported channel."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.communicationMessageReference =
      definition.communicationMessageReference;
    this.channel = definition.channel;
    this.recipientReference = definition.recipientReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
