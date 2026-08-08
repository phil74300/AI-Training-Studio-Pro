import { cloneValue } from "./FrontendRuntimeValue";

const lifecycleStates = new Set(["INITIALIZING", "READY", "ERROR", "STOPPED"]);

export class RendererRuntime {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.rendererIdentity ||
      !definition?.environmentReference ||
      !definition?.loadedApplicationReference
    )
      throw new TypeError(
        "RendererRuntime requires id, rendererIdentity, environmentReference, and loadedApplicationReference."
      );
    const lifecycleState = definition.lifecycleState || "INITIALIZING";
    if (!lifecycleStates.has(lifecycleState))
      throw new TypeError(
        "RendererRuntime requires a supported lifecycleState."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.rendererIdentity = definition.rendererIdentity;
    this.environmentReference = definition.environmentReference;
    this.loadedApplicationReference = definition.loadedApplicationReference;
    this.lifecycleState = lifecycleState;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
