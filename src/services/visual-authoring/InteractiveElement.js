import { cloneValue } from "./VisualAuthoringValue";

export class InteractiveElement {
  constructor(definition) {
    if (
      !definition?.id ||
      (!definition?.iframeReference &&
        !definition?.externalInteractiveReference &&
        !definition?.simulationReference)
    )
      throw new TypeError(
        "InteractiveElement requires id and an iframe, external interactive, or simulation reference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.iframeReference = definition.iframeReference || null;
    this.externalInteractiveReference =
      definition.externalInteractiveReference || null;
    this.simulationReference = definition.simulationReference || null;
    this.accessibility = cloneValue({
      alternativeTextReference:
        definition.accessibility?.alternativeTextReference || null,
      transcriptReference:
        definition.accessibility?.transcriptReference || null,
      validationReference:
        definition.accessibility?.validationReference || null,
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
