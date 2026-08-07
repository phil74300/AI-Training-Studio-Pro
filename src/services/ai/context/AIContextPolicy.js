import {
  AIContextItemType,
  AIContextRedactionStatus,
  AIContextSensitivity,
} from "./AIContextItem";

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

const normalizeEnumList = (values, allowedValues, field) => {
  if (!Array.isArray(values)) {
    throw new TypeError(`${field} must be an array.`);
  }

  const normalized = [...new Set(values)];
  const unsupported = normalized.find(
    (value) => !allowedValues.includes(value)
  );

  if (unsupported) {
    throw new TypeError(
      `${field} contains an unsupported value: ${unsupported}`
    );
  }

  return Object.freeze(normalized);
};

const normalizeSensitiveRules = (rules) => {
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
    throw new TypeError("sensitiveContentRules must be an object.");
  }

  return Object.freeze(
    Object.fromEntries(
      Object.values(AIContextSensitivity).map((classification) => {
        const rule = rules[classification] || {};

        if (typeof rule !== "object" || Array.isArray(rule)) {
          throw new TypeError(
            `Sensitive content rule ${classification} must be an object.`
          );
        }

        return [
          classification,
          Object.freeze({
            allowed: rule.allowed !== false,
            requiresConfirmation: rule.requiresConfirmation === true,
            requiresRedaction: rule.requiresRedaction === true,
          }),
        ];
      })
    )
  );
};

const normalizeProviderRestrictions = (restrictions) => {
  if (
    !restrictions ||
    typeof restrictions !== "object" ||
    Array.isArray(restrictions)
  ) {
    throw new TypeError("providerRestrictions must be an object.");
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(restrictions).map(([providerId, restriction]) => {
        const normalizedProviderId = requireText(
          providerId,
          "Provider restriction id"
        );

        if (
          !restriction ||
          typeof restriction !== "object" ||
          Array.isArray(restriction)
        ) {
          throw new TypeError(
            `Provider restriction ${providerId} must be an object.`
          );
        }

        return [
          normalizedProviderId,
          Object.freeze({
            allowedContentTypes:
              restriction.allowedContentTypes === undefined
                ? null
                : normalizeEnumList(
                    restriction.allowedContentTypes,
                    Object.values(AIContextItemType),
                    `providerRestrictions.${providerId}.allowedContentTypes`
                  ),
            allowedSensitivities:
              restriction.allowedSensitivities === undefined
                ? null
                : normalizeEnumList(
                    restriction.allowedSensitivities,
                    Object.values(AIContextSensitivity),
                    `providerRestrictions.${providerId}.allowedSensitivities`
                  ),
            requiresConfirmation: restriction.requiresConfirmation === true,
          }),
        ];
      })
    )
  );
};

const normalizeConfirmationRequirements = (requirements) => {
  if (
    !requirements ||
    typeof requirements !== "object" ||
    Array.isArray(requirements)
  ) {
    throw new TypeError("confirmationRequirements must be an object.");
  }

  if (
    requirements.providerIds !== undefined &&
    !Array.isArray(requirements.providerIds)
  ) {
    throw new TypeError(
      "confirmationRequirements.providerIds must be an array."
    );
  }

  return Object.freeze({
    allItems: requirements.allItems === true,
    sensitivities: normalizeEnumList(
      requirements.sensitivities || [],
      Object.values(AIContextSensitivity),
      "confirmationRequirements.sensitivities"
    ),
    providerIds: Object.freeze(
      [...new Set(requirements.providerIds || [])].map((providerId) =>
        requireText(providerId, "confirmationRequirements provider id")
      )
    ),
  });
};

const DEFAULT_SENSITIVE_CONTENT_RULES = Object.freeze({
  [AIContextSensitivity.PUBLIC]: Object.freeze({ allowed: true }),
  [AIContextSensitivity.INTERNAL]: Object.freeze({ allowed: true }),
  [AIContextSensitivity.CONFIDENTIAL]: Object.freeze({
    allowed: true,
    requiresConfirmation: true,
  }),
  [AIContextSensitivity.RESTRICTED]: Object.freeze({ allowed: false }),
});

export const AI_CONTEXT_POLICY_SCHEMA_VERSION = 1;

export class AIContextPolicy {
  constructor({
    schemaVersion = AI_CONTEXT_POLICY_SCHEMA_VERSION,
    id = "default-context-policy",
    version = "1.0",
    allowedContentTypes = Object.values(AIContextItemType),
    maximumContextSize = null,
    sensitiveContentRules = DEFAULT_SENSITIVE_CONTENT_RULES,
    providerRestrictions = {},
    confirmationRequirements = {},
  } = {}) {
    if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
      throw new TypeError("Context policy schemaVersion must be positive.");
    }

    if (
      maximumContextSize !== null &&
      (!Number.isInteger(maximumContextSize) || maximumContextSize <= 0)
    ) {
      throw new TypeError(
        "maximumContextSize must be a positive integer or null."
      );
    }

    this.schemaVersion = schemaVersion;
    this.id = requireText(id, "Context policy id");
    this.version = requireText(version, "Context policy version");
    this.allowedContentTypes = normalizeEnumList(
      allowedContentTypes,
      Object.values(AIContextItemType),
      "allowedContentTypes"
    );
    this.maximumContextSize = maximumContextSize;
    this.sensitiveContentRules = normalizeSensitiveRules(sensitiveContentRules);
    this.providerRestrictions =
      normalizeProviderRestrictions(providerRestrictions);
    this.confirmationRequirements = normalizeConfirmationRequirements(
      confirmationRequirements
    );

    Object.freeze(this);
  }

  assess(item, { providerId = null, confirmed = false } = {}) {
    if (!item || typeof item !== "object") {
      throw new TypeError("Context policy assessment requires a context item.");
    }

    if (!Object.values(AIContextItemType).includes(item.type)) {
      throw new TypeError(`Unsupported context item type: ${item.type}`);
    }

    if (!Object.values(AIContextSensitivity).includes(item.sensitivity)) {
      throw new TypeError(
        `Unsupported sensitivity classification: ${item.sensitivity}`
      );
    }

    const normalizedProviderId =
      providerId === null ? null : requireText(providerId, "Provider id");

    if (typeof confirmed !== "boolean") {
      throw new TypeError("Context confirmation state must be a boolean.");
    }

    const reasons = [];
    const sensitiveRule = this.sensitiveContentRules[item.sensitivity];
    const providerRestriction = normalizedProviderId
      ? this.providerRestrictions[normalizedProviderId]
      : null;

    if (!this.allowedContentTypes.includes(item.type)) {
      reasons.push("content-type-not-allowed");
    }

    if (!sensitiveRule.allowed) {
      reasons.push("sensitivity-not-allowed");
    }

    if (
      providerRestriction?.allowedContentTypes &&
      !providerRestriction.allowedContentTypes.includes(item.type)
    ) {
      reasons.push("provider-content-type-not-allowed");
    }

    if (
      providerRestriction?.allowedSensitivities &&
      !providerRestriction.allowedSensitivities.includes(item.sensitivity)
    ) {
      reasons.push("provider-sensitivity-not-allowed");
    }

    const requiresConfirmation =
      sensitiveRule.requiresConfirmation ||
      this.confirmationRequirements.allItems ||
      this.confirmationRequirements.sensitivities.includes(item.sensitivity) ||
      (normalizedProviderId !== null &&
        this.confirmationRequirements.providerIds.includes(
          normalizedProviderId
        )) ||
      providerRestriction?.requiresConfirmation === true;

    const requiresRedaction = sensitiveRule.requiresRedaction;

    if (requiresConfirmation && !confirmed) {
      reasons.push("confirmation-required");
    }

    if (
      requiresRedaction &&
      item.redactionStatus !== AIContextRedactionStatus.APPLIED
    ) {
      reasons.push("redaction-required");
    }

    return Object.freeze({
      allowed: reasons.length === 0,
      requiresConfirmation,
      confirmationSatisfied: !requiresConfirmation || confirmed,
      requiresRedaction,
      reasons: Object.freeze(reasons),
    });
  }

  toReference() {
    return cloneValue({
      id: this.id,
      version: this.version,
      schemaVersion: this.schemaVersion,
      maximumContextSize: this.maximumContextSize,
    });
  }
}
