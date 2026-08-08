import { cloneValue } from "./FrontendRuntimeValue";

export class WorkspaceRendererReference {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.workspaceReference ||
      !definition?.layoutReference
    )
      throw new TypeError(
        "WorkspaceRendererReference requires id, workspaceReference, and layoutReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.workspaceReference = definition.workspaceReference;
    this.layoutReference = definition.layoutReference;
    this.componentReferences = Object.freeze([
      ...(definition.componentReferences || []),
    ]);
    this.viewReferences = Object.freeze([...(definition.viewReferences || [])]);
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
