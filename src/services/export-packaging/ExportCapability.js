import { ExportFormat } from "./ExportFormat";

export const ExportCapability = Object.freeze(
  Object.fromEntries(
    Object.entries(ExportFormat).map(([key, format]) => [
      key,
      Object.freeze({ id: format, available: false, requiresAdapter: true }),
    ])
  )
);
