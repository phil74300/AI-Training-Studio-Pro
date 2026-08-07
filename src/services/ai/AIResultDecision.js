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

const optionalText = (value, field) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string or null.`);
  }

  return value.trim();
};

const normalizeTimestamp = (value) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new TypeError("Decision timestamp must be a date-time string.");
  }

  return value;
};

const normalizeSelectedPortions = (portions) => {
  if (!Array.isArray(portions)) {
    throw new TypeError("selectedPortions must be an array.");
  }

  return Object.freeze(
    portions.map((portion) => {
      if (!portion || typeof portion !== "object" || Array.isArray(portion)) {
        throw new TypeError("Selected portions must be objects.");
      }

      return cloneValue(portion);
    })
  );
};

const normalizeReference = (reference, field) => {
  if (reference === null) {
    return null;
  }

  if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
    throw new TypeError(`${field} must be an object or null.`);
  }

  return cloneValue(reference);
};

export const AIResultDecisionType = Object.freeze({
  ACCEPT: "ACCEPT",
  PARTIAL_ACCEPT: "PARTIAL_ACCEPT",
  REGENERATE: "REGENERATE",
  DISCARD: "DISCARD",
});

export const AI_RESULT_DECISION_SCHEMA_VERSION = 1;

export class AIResultDecision {
  constructor({
    schemaVersion = AI_RESULT_DECISION_SCHEMA_VERSION,
    type,
    timestamp,
    userNote = null,
    reason = null,
    selectedPortions = [],
    sourceVersionReference = null,
    metadata = {},
  }) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Decision schemaVersion must be positive.");
    }

    if (!Object.values(AIResultDecisionType).includes(type)) {
      throw new TypeError(`Unsupported AI result decision: ${type}`);
    }

    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new TypeError("Decision metadata must be an object.");
    }

    this.schemaVersion = schemaVersion;
    this.type = type;
    this.timestamp = normalizeTimestamp(timestamp);
    this.userNote = optionalText(userNote, "userNote");
    this.reason = optionalText(reason, "reason");
    this.selectedPortions = normalizeSelectedPortions(selectedPortions);
    this.sourceVersionReference = normalizeReference(
      sourceVersionReference,
      "sourceVersionReference"
    );
    this.metadata = cloneValue(metadata);

    if (
      this.type === AIResultDecisionType.PARTIAL_ACCEPT &&
      this.selectedPortions.length === 0
    ) {
      throw new Error("Partial acceptance requires selected portions.");
    }

    Object.freeze(this);
  }

  static from(decision) {
    return decision instanceof AIResultDecision
      ? decision
      : new AIResultDecision(decision);
  }
}
