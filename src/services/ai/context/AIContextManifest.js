const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
      )
    );
  }

  return value;
};

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const cloneRecords = (values, field) => {
  if (!Array.isArray(values)) {
    throw new TypeError(`${field} must be an array.`);
  }

  return Object.freeze(
    values.map((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`${field} must contain only objects.`);
      }

      return cloneValue(value);
    })
  );
};

const normalizeDestination = (destination) => {
  if (
    !destination ||
    typeof destination !== "object" ||
    Array.isArray(destination)
  ) {
    throw new TypeError("Context manifest destination must be an object.");
  }

  const optionalText = (value, field) =>
    value === null ? null : requireText(value, field);

  return Object.freeze({
    providerId: optionalText(
      destination.providerId ?? null,
      "destination.providerId"
    ),
    modelId: optionalText(destination.modelId ?? null, "destination.modelId"),
  });
};

export const AIContextStaleStatus = Object.freeze({
  NOT_CHECKED: "not-checked",
  CURRENT: "current",
  STALE: "stale",
  UNKNOWN: "unknown",
});

export const AI_CONTEXT_MANIFEST_SCHEMA_VERSION = 1;

export class AIContextManifest {
  constructor({
    schemaVersion = AI_CONTEXT_MANIFEST_SCHEMA_VERSION,
    snapshotId,
    includedItems = [],
    excludedItems = [],
    ordering = [],
    truncationDecisions = [],
    deduplicationDecisions = [],
    redactionDecisions = [],
    validationResults = [],
    staleContextStatus = AIContextStaleStatus.NOT_CHECKED,
    destination = {},
    confirmations = [],
    policy,
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Context manifest schemaVersion must be positive.");
    }

    if (!Object.values(AIContextStaleStatus).includes(staleContextStatus)) {
      throw new TypeError(
        `Unsupported stale context status: ${staleContextStatus}`
      );
    }

    if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
      throw new TypeError("Context manifest policy must be an object.");
    }

    this.schemaVersion = schemaVersion;
    this.snapshotId = requireText(snapshotId, "Context manifest snapshotId");
    this.includedItems = cloneRecords(includedItems, "includedItems");
    this.excludedItems = cloneRecords(excludedItems, "excludedItems");
    this.ordering = Object.freeze(
      ordering.map((itemId) => requireText(itemId, "Context ordering item id"))
    );
    this.truncationDecisions = cloneRecords(
      truncationDecisions,
      "truncationDecisions"
    );
    this.deduplicationDecisions = cloneRecords(
      deduplicationDecisions,
      "deduplicationDecisions"
    );
    this.redactionDecisions = cloneRecords(
      redactionDecisions,
      "redactionDecisions"
    );
    this.validationResults = cloneRecords(
      validationResults,
      "validationResults"
    );
    this.staleContextStatus = staleContextStatus;
    this.destination = normalizeDestination(destination);
    this.confirmations = cloneRecords(confirmations, "confirmations");
    this.policy = cloneValue(policy);

    const includedIds = this.includedItems.map((item) => item.id);

    if (
      this.ordering.length !== includedIds.length ||
      this.ordering.some((itemId, index) => itemId !== includedIds[index])
    ) {
      throw new Error(
        "Context manifest ordering must match the included item order."
      );
    }

    Object.freeze(this);
  }

  explain() {
    return Object.freeze({
      snapshotId: this.snapshotId,
      includedItems: this.includedItems,
      excludedItems: this.excludedItems,
      ordering: this.ordering,
      truncationDecisions: this.truncationDecisions,
      deduplicationDecisions: this.deduplicationDecisions,
      redactionDecisions: this.redactionDecisions,
      validationResults: this.validationResults,
      staleContextStatus: this.staleContextStatus,
      destination: this.destination,
      confirmations: this.confirmations,
      policy: this.policy,
    });
  }
}
