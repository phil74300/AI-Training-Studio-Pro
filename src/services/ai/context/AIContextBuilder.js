import { AI_CONTEXT_ITEM_SCHEMA_VERSION, AIContextItem } from "./AIContextItem";
import {
  AI_CONTEXT_MANIFEST_SCHEMA_VERSION,
  AIContextManifest,
  AIContextStaleStatus,
} from "./AIContextManifest";
import { AIContextPolicy } from "./AIContextPolicy";
import {
  AI_CONTEXT_SNAPSHOT_SCHEMA_VERSION,
  AIContextSnapshot,
} from "./AIContextSnapshot";

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalText = (value, field) => {
  return value === null ? null : requireText(value, field);
};

const normalizeIds = (values, field) => {
  if (!Array.isArray(values)) {
    throw new TypeError(`${field} must be an array.`);
  }

  const ids = values.map((value) => requireText(value, `${field} item`));

  if (new Set(ids).size !== ids.length) {
    throw new Error(`${field} cannot contain duplicate identifiers.`);
  }

  return Object.freeze(ids);
};

const normalizeDestination = (destination) => {
  if (
    !destination ||
    typeof destination !== "object" ||
    Array.isArray(destination)
  ) {
    throw new TypeError("destination must be an object.");
  }

  return Object.freeze({
    providerId: optionalText(
      destination.providerId ?? null,
      "destination.providerId"
    ),
    modelId: optionalText(destination.modelId ?? null, "destination.modelId"),
  });
};

const normalizeSourceStates = (sourceStates) => {
  if (
    !sourceStates ||
    typeof sourceStates !== "object" ||
    Array.isArray(sourceStates)
  ) {
    throw new TypeError("sourceStates must be an object.");
  }

  return sourceStates;
};

const getStaleStatus = (item, sourceState) => {
  if (sourceState === undefined) {
    return AIContextStaleStatus.NOT_CHECKED;
  }

  if (!sourceState || typeof sourceState !== "object") {
    throw new TypeError(`Source state for ${item.id} must be an object.`);
  }

  const comparableValues = [
    [item.sourceVersion, sourceState.sourceVersion],
    [item.contentHash, sourceState.contentHash],
  ].filter(([captured, current]) => captured !== null && current != null);

  if (comparableValues.length === 0) {
    return AIContextStaleStatus.UNKNOWN;
  }

  return comparableValues.some(([captured, current]) => captured !== current)
    ? AIContextStaleStatus.STALE
    : AIContextStaleStatus.CURRENT;
};

const getSnapshotStaleStatus = (validationResults) => {
  const statuses = validationResults
    .filter((result) => result.selected)
    .map((result) => result.staleStatus);

  if (statuses.includes(AIContextStaleStatus.STALE)) {
    return AIContextStaleStatus.STALE;
  }

  if (statuses.includes(AIContextStaleStatus.NOT_CHECKED)) {
    return AIContextStaleStatus.NOT_CHECKED;
  }

  if (
    statuses.includes(AIContextStaleStatus.UNKNOWN) ||
    statuses.length === 0
  ) {
    return AIContextStaleStatus.UNKNOWN;
  }

  return AIContextStaleStatus.CURRENT;
};

export class AIContextBuilder {
  #policy;

  constructor(policy = new AIContextPolicy()) {
    this.#policy =
      policy instanceof AIContextPolicy ? policy : new AIContextPolicy(policy);
  }

  build({
    snapshotId,
    createdAt = new Date().toISOString(),
    projectId = null,
    chapterId = null,
    items = [],
    selectedItemIds = [],
    confirmedItemIds = [],
    sourceStates = {},
    destination = {},
    policy = this.#policy,
  }) {
    if (!Array.isArray(items)) {
      throw new TypeError("Context items must be an array.");
    }

    const id = requireText(snapshotId, "snapshotId");
    const normalizedProjectId = optionalText(projectId, "projectId");
    const normalizedChapterId = optionalText(chapterId, "chapterId");
    const candidates = Object.freeze(
      items.map((item) => AIContextItem.from(item))
    );
    const selectedIds = normalizeIds(selectedItemIds, "selectedItemIds");
    const confirmedIds = new Set(
      normalizeIds(confirmedItemIds, "confirmedItemIds")
    );
    const normalizedSourceStates = normalizeSourceStates(sourceStates);
    const normalizedDestination = normalizeDestination(destination);
    const resolvedPolicy =
      policy instanceof AIContextPolicy ? policy : new AIContextPolicy(policy);
    const candidatesById = new Map();

    candidates.forEach((item) => {
      if (candidatesById.has(item.id)) {
        throw new Error(`Duplicate context item identifier: ${item.id}`);
      }

      candidatesById.set(item.id, item);
    });

    Object.keys(normalizedSourceStates).forEach((itemId) => {
      if (!candidatesById.has(itemId)) {
        throw new Error(`Source state context item is unavailable: ${itemId}`);
      }
    });

    selectedIds.forEach((itemId) => {
      if (!candidatesById.has(itemId)) {
        throw new Error(`Selected context item is unavailable: ${itemId}`);
      }
    });

    confirmedIds.forEach((itemId) => {
      if (!selectedIds.includes(itemId)) {
        throw new Error(`Confirmed context item is not selected: ${itemId}`);
      }
    });

    const selectedIdSet = new Set(selectedIds);
    const includedItems = [];
    const excludedItems = candidates
      .filter((item) => !selectedIdSet.has(item.id))
      .map((item) => ({
        ...item.toManifestEntry(),
        reasons: Object.freeze(["not-selected"]),
      }));
    const truncationDecisions = [];
    const deduplicationDecisions = [];
    const redactionDecisions = [];
    const confirmations = [];
    const validationResults = candidates.map((item) => ({
      itemId: item.id,
      selected: selectedIdSet.has(item.id),
      valid: true,
      hasSourceVersion: item.sourceVersion !== null,
      hasContentHash: item.contentHash !== null,
      staleStatus: getStaleStatus(item, normalizedSourceStates[item.id]),
    }));
    const validationsById = new Map(
      validationResults.map((result) => [result.itemId, result])
    );
    const includedHashes = new Map();
    let estimatedTokens = 0;
    let includesUnknownEstimates = false;

    selectedIds.forEach((itemId) => {
      const item = candidatesById.get(itemId);
      const confirmed = confirmedIds.has(itemId);
      const assessment = resolvedPolicy.assess(item, {
        providerId: normalizedDestination.providerId,
        confirmed,
      });
      const validation = validationsById.get(itemId);
      const reasons = [...assessment.reasons];

      if (validation.staleStatus === AIContextStaleStatus.STALE) {
        reasons.push("stale-context");
      }

      if (assessment.requiresConfirmation) {
        confirmations.push({
          itemId,
          required: true,
          confirmed,
        });
      }

      redactionDecisions.push({
        itemId,
        required: assessment.requiresRedaction,
        status: item.redactionStatus,
        accepted: !assessment.requiresRedaction || assessment.allowed,
      });

      if (reasons.length > 0) {
        excludedItems.push({
          ...item.toManifestEntry(),
          reasons: Object.freeze(reasons),
        });
        return;
      }

      if (item.contentHash && includedHashes.has(item.contentHash)) {
        const duplicateOf = includedHashes.get(item.contentHash);

        excludedItems.push({
          ...item.toManifestEntry(),
          reasons: Object.freeze(["duplicate-content"]),
        });
        deduplicationDecisions.push({
          itemId,
          action: "excluded",
          duplicateOf,
          contentHash: item.contentHash,
        });
        return;
      }

      const itemTokens = item.sizeEstimate.tokens;

      if (resolvedPolicy.maximumContextSize !== null && itemTokens === null) {
        excludedItems.push({
          ...item.toManifestEntry(),
          reasons: Object.freeze(["token-estimate-required"]),
        });
        truncationDecisions.push({
          itemId,
          action: "excluded",
          reason: "token-estimate-required",
        });
        return;
      }

      if (
        resolvedPolicy.maximumContextSize !== null &&
        estimatedTokens + itemTokens > resolvedPolicy.maximumContextSize
      ) {
        excludedItems.push({
          ...item.toManifestEntry(),
          reasons: Object.freeze(["context-size-limit"]),
        });
        truncationDecisions.push({
          itemId,
          action: "excluded",
          reason: "context-size-limit",
          estimatedTokens: itemTokens,
        });
        return;
      }

      includedItems.push(item);

      if (item.contentHash) {
        includedHashes.set(item.contentHash, item.id);
      }

      if (itemTokens === null) {
        includesUnknownEstimates = true;
      } else {
        estimatedTokens += itemTokens;
      }
    });

    const manifest = new AIContextManifest({
      snapshotId: id,
      includedItems: includedItems.map((item) => item.toManifestEntry()),
      excludedItems,
      ordering: includedItems.map((item) => item.id),
      truncationDecisions,
      deduplicationDecisions,
      redactionDecisions,
      validationResults,
      staleContextStatus: getSnapshotStaleStatus(validationResults),
      destination: normalizedDestination,
      confirmations,
      policy: resolvedPolicy.toReference(),
    });

    return new AIContextSnapshot({
      id,
      createdAt,
      projectId: normalizedProjectId,
      chapterId: normalizedChapterId,
      items: includedItems,
      tokenEstimate: {
        estimatedTokens,
        includesUnknownEstimates,
        totalBudget: resolvedPolicy.maximumContextSize,
      },
      sourceMetadata: {
        candidateCount: candidates.length,
        selectedCount: selectedIds.length,
        includedCount: includedItems.length,
        sources: includedItems.map((item) => item.sourceReference),
        destination: normalizedDestination,
      },
      versionInformation: {
        snapshotSchemaVersion: AI_CONTEXT_SNAPSHOT_SCHEMA_VERSION,
        itemSchemaVersion: AI_CONTEXT_ITEM_SCHEMA_VERSION,
        manifestSchemaVersion: AI_CONTEXT_MANIFEST_SCHEMA_VERSION,
        policy: resolvedPolicy.toReference(),
      },
      manifest,
    });
  }
}
