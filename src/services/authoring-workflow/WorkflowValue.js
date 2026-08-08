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

export const normalizeTimestamp = (value, field) => {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime()))
    throw new TypeError(`${field} requires a valid timestamp.`);
  return timestamp.toISOString();
};
