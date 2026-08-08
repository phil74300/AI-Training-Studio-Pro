export const cloneValue = (v) => {
  if (Array.isArray(v)) return Object.freeze(v.map(cloneValue));
  if (v && typeof v === "object")
    return Object.freeze(
      Object.fromEntries(Object.entries(v).map(([k, i]) => [k, cloneValue(i)]))
    );
  return v;
};
