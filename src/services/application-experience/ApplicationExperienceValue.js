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
