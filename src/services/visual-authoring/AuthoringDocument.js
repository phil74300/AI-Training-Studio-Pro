import { ContentBlock } from "./ContentBlock";
import { DocumentSection } from "./DocumentSection";
import { cloneValue } from "./VisualAuthoringValue";

export class AuthoringDocument {
  constructor(definition) {
    if (!definition?.id || !definition?.authoringWorkspaceReference)
      throw new TypeError(
        "AuthoringDocument requires id and authoringWorkspaceReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.authoringWorkspaceReference = definition.authoringWorkspaceReference;
    this.title = definition.title || null;
    this.hierarchyReference = definition.hierarchyReference || null;
    this.order = definition.order ?? null;
    this.sections = Object.freeze(
      (definition.sections || []).map((section) =>
        section instanceof DocumentSection
          ? section
          : new DocumentSection(section)
      )
    );
    this.blocks = Object.freeze(
      (definition.blocks || []).map((block) =>
        block instanceof ContentBlock ? block : new ContentBlock(block)
      )
    );
    this.metadata = cloneValue(definition.metadata || {});
    this.versionReference = definition.versionReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
