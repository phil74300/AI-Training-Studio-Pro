import { AnalyticsIndicatorType } from "./AnalyticsIndicatorType";
import { AnalyticsPeriod } from "./AnalyticsPeriod";

const indicatorTypes = new Set(Object.values(AnalyticsIndicatorType));

export class AnalyticsIndicator {
  constructor(definition) {
    if (
      !definition?.id ||
      !indicatorTypes.has(definition?.type) ||
      definition?.value === undefined ||
      !definition?.calculationReference
    )
      throw new TypeError(
        "AnalyticsIndicator requires id, supported type, value, and calculationReference."
      );
    this.schemaVersion = 1;
    this.id = definition.id;
    this.type = definition.type;
    this.value = definition.value;
    this.unit = definition.unit || null;
    this.calculationReference = definition.calculationReference;
    this.period =
      definition.period instanceof AnalyticsPeriod
        ? definition.period
        : new AnalyticsPeriod(definition.period);
    this.aggregationReference = definition.aggregationReference || null;
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    Object.freeze(this);
  }
}
