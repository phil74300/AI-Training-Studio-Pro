export const assertKnownFields = (value, fields, name) => {
  const unknownFields = Object.keys(value).filter(
    (field) => !fields.includes(field)
  );

  if (unknownFields.length > 0) {
    throw new TypeError(
      `${name} contains unknown fields: ${unknownFields.join(", ")}`
    );
  }
};

export const requireRecord = (value, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }

  return value;
};

export const cloneValue = (value, field = "value") => {
  if (Array.isArray(value)) {
    return Object.freeze(
      value.map((item, index) => cloneValue(item, `${field}[${index}]`))
    );
  }

  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${field} must contain only plain values.`);
    }

    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          cloneValue(item, `${field}.${key}`),
        ])
      )
    );
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError(`${field} must contain only finite numbers.`);
  }

  if (
    value !== null &&
    !["string", "number", "boolean"].includes(typeof value)
  ) {
    throw new TypeError(`${field} contains an unsupported value.`);
  }

  return value;
};

export const cloneRecord = (value, field) =>
  cloneValue(requireRecord(value, field), field);

export const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

export const optionalText = (value, field) =>
  value === null ? null : requireText(value, field);

export const normalizeSchemaVersion = (value, field) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive integer.`);
  }

  return value;
};

export const normalizeOrder = (value, field) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${field} must be a non-negative integer.`);
  }

  return value;
};

export const normalizeTimestamp = (value, field) => {
  const timestamp = requireText(value, field);
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field} must be a valid date-time string.`);
  }

  return date.toISOString();
};

export const normalizeEnum = (value, allowedValues, field) => {
  if (!Object.values(allowedValues).includes(value)) {
    throw new TypeError(`${field} contains an unsupported value: ${value}`);
  }

  return value;
};

export const normalizeTextArray = (values, field) => {
  if (!Array.isArray(values)) {
    throw new TypeError(`${field} must be an array.`);
  }

  const normalized = values.map((value) => requireText(value, `${field} item`));

  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} cannot contain duplicates.`);
  }

  return Object.freeze(normalized);
};

export const normalizeModelArray = (values, Model, field) => {
  if (!Array.isArray(values)) {
    throw new TypeError(`${field} must be an array.`);
  }

  const normalized = values.map((value) => Model.from(value));
  const ids = normalized.map((value) => value.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error(`${field} cannot contain duplicate identifiers.`);
  }

  return Object.freeze(normalized);
};

export const toRecordArray = (values) =>
  values.map((value) => value.toRecord());
