export const NotificationVariable = Object.freeze({
  LEARNER_NAME: "{{learner.name}}",
  TRAINING_TITLE: "{{training.title}}",
  SESSION_DATE: "{{session.date}}",
  TRAINER_NAME: "{{trainer.name}}",
  CERTIFICATE_EXPIRY: "{{certificate.expiry}}",
  ACTION_DEADLINE: "{{action.deadline}}",
});

const variables = new Set(Object.values(NotificationVariable));

export class NotificationTemplate {
  constructor(definition) {
    if (
      !definition?.id ||
      !definition?.title ||
      !definition?.contentReference ||
      !definition?.language ||
      !definition?.version
    )
      throw new TypeError(
        "NotificationTemplate requires id, title, contentReference, language, and version."
      );
    const templateVariables = definition.variables || [];
    if (templateVariables.some((variable) => !variables.has(variable)))
      throw new TypeError("NotificationTemplate requires supported variables.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.contentReference = definition.contentReference;
    this.language = definition.language;
    this.version = definition.version;
    this.variables = Object.freeze([...templateVariables]);
    this.status = definition.status || "draft";
    this.provenance = Object.freeze({ ...(definition.provenance || {}) });
    this.createdAt = new Date(definition.createdAt || Date.now()).toISOString();
    Object.freeze(this);
  }
}
