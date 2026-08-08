const freezeValue = (value) => {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeValue));
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeValue);
    Object.freeze(value);
  }
  return value;
};

export class PPTXImportResult {
  constructor(definition) {
    this.schemaVersion = 1;
    this.success = definition.success;
    this.document = definition.document || null;
    this.warnings = freezeValue([...(definition.warnings || [])]);
    this.unsupportedElements = freezeValue([
      ...(definition.unsupportedElements || []),
    ]);
    this.detectedStructure = freezeValue(definition.detectedStructure || {});
    this.statistics = freezeValue(definition.statistics || {});
    this.error = definition.error || null;
    Object.freeze(this);
  }
  static completed(definition) {
    return new PPTXImportResult({ ...definition, success: true, error: null });
  }
  static failed(error) {
    return new PPTXImportResult({
      success: false,
      error,
      warnings: [],
      unsupportedElements: [],
      detectedStructure: {},
      statistics: {},
    });
  }
}
