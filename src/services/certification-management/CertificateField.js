export const CertificateVariable = Object.freeze({
  LEARNER_NAME: "{{learner.name}}",
  TRAINING_TITLE: "{{training.title}}",
  TRAINING_DATE: "{{training.date}}",
  TRAINER_NAME: "{{trainer.name}}",
  CERTIFICATE_NUMBER: "{{certificate.number}}",
  EXPIRY_DATE: "{{expiry.date}}",
});

const supportedVariables = new Set(Object.values(CertificateVariable));

export class CertificateField {
  constructor(definition) {
    if (!definition?.id || !definition.variable)
      throw new TypeError("CertificateField requires id and variable.");
    if (!supportedVariables.has(definition.variable))
      throw new TypeError("CertificateField requires a supported variable.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.variable = definition.variable;
    this.label = definition.label || null;
    this.fontFamily = definition.fontFamily || null;
    this.fontSize = definition.fontSize ?? null;
    this.textStyle = Object.freeze({ ...(definition.textStyle || {}) });
    this.alignment = definition.alignment || "left";
    this.position = Object.freeze({ ...(definition.position || {}) });
    this.dimensions = Object.freeze({ ...(definition.dimensions || {}) });
    Object.freeze(this);
  }
}
