import { AIProposalStatus } from "./AIProposalStatus";

const proposalStatuses = new Set(Object.values(AIProposalStatus));

export const cloneValue = (value) => {
  if (Array.isArray(value)) return Object.freeze(value.map(cloneValue));
  if (value && typeof value === "object")
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
      )
    );
  return value;
};

export const normalizeProposal = (definition, type) => {
  if (
    !definition?.id ||
    !definition?.version ||
    !definition?.sourceReference ||
    !definition?.aiProvenance
  )
    throw new TypeError(
      `${type} requires id, version, sourceReference, and aiProvenance.`
    );
  const status = definition.status || AIProposalStatus.PROPOSED;
  if (!proposalStatuses.has(status))
    throw new TypeError(`${type} requires a supported status.`);
  if (
    typeof definition.confidence !== "number" ||
    definition.confidence < 0 ||
    definition.confidence > 1
  )
    throw new TypeError(`${type} confidence must be between 0 and 1.`);
  return {
    schemaVersion: 1,
    id: definition.id,
    version: definition.version,
    sourceReference: definition.sourceReference,
    aiProvenance: cloneValue(definition.aiProvenance),
    confidence: definition.confidence,
    status,
    proposalOnly: true,
    reviewRequired: true,
    resultReviewReference: definition.resultReviewReference || null,
    provenance: cloneValue(definition.provenance || {}),
  };
};
