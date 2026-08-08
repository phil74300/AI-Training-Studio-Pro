import { AuthoringWorkspaceStatus } from "./AuthoringWorkspaceStatus";
import { cloneValue } from "./VisualAuthoringValue";

const statuses = new Set(Object.values(AuthoringWorkspaceStatus));

export class AuthoringWorkspace {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.trainingCourseReference ||
      !definition?.authorReference
    )
      throw new TypeError(
        "AuthoringWorkspace requires id, trainingCourseReference, and authorReference."
      );
    const status = definition.status || AuthoringWorkspaceStatus.DRAFT;
    if (!statuses.has(status))
      throw new TypeError("AuthoringWorkspace requires a supported status.");
    if (
      definition.aiAuthoringProposal?.confidence !== undefined &&
      (typeof definition.aiAuthoringProposal.confidence !== "number" ||
        definition.aiAuthoringProposal.confidence < 0 ||
        definition.aiAuthoringProposal.confidence > 1)
    )
      throw new TypeError(
        "AuthoringWorkspace AI proposal confidence must be between 0 and 1."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.trainingCourseReference = definition.trainingCourseReference;
    this.authorReference = definition.authorReference;
    this.currentVersionReference = definition.currentVersionReference || null;
    this.status = status;
    this.documentReferences = Object.freeze([
      ...(definition.documentReferences || []),
    ]);
    this.aiAuthoringProposal = cloneValue({
      layoutReferences: definition.aiAuthoringProposal?.layoutReferences || [],
      contentOrganizationReferences:
        definition.aiAuthoringProposal?.contentOrganizationReferences || [],
      missingSectionReferences:
        definition.aiAuthoringProposal?.missingSectionReferences || [],
      mediaPlacementReferences:
        definition.aiAuthoringProposal?.mediaPlacementReferences || [],
      accessibilityImprovementReferences:
        definition.aiAuthoringProposal?.accessibilityImprovementReferences ||
        [],
      confidence: definition.aiAuthoringProposal?.confidence ?? null,
      status: "PROPOSAL_ONLY",
      validationState: "PENDING_HUMAN_AUTHOR_VALIDATION",
    });
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
