import { cloneValue } from "./PortalEngineValue";
import { PortalState } from "./PortalState";
import { ViewContainer } from "./ViewContainer";

const states = new Set(Object.values(PortalState));

export class WorkspaceContainer {
  constructor(definition) {
    if (!definition?.id || !definition?.workspaceReference)
      throw new TypeError(
        "WorkspaceContainer requires id and workspaceReference."
      );
    const availableViews = definition.availableViews || [];
    if (availableViews.some((view) => !(view instanceof ViewContainer)))
      throw new TypeError(
        "WorkspaceContainer requires ViewContainer instances as availableViews."
      );
    const state = definition.state || PortalState.LOADING;
    if (!states.has(state))
      throw new TypeError("WorkspaceContainer requires a supported state.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workspaceReference = definition.workspaceReference;
    this.availableViews = Object.freeze([...availableViews]);
    this.contextReferences = Object.freeze([
      ...(definition.contextReferences || []),
    ]);
    this.state = state;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
