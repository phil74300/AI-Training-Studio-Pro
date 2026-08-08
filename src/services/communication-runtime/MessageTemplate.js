import { cloneValue } from "./CommunicationRuntimeValue";

const variables = new Set([
  "{{learner.name}}",
  "{{training.title}}",
  "{{certificate.expiry}}",
  "{{task.deadline}}",
  "{{trainer.name}}",
]);

export class MessageTemplate {
  constructor(definition) {
    if (!definition?.id || !definition?.title)
      throw new TypeError("MessageTemplate requires id and title.");
    const templateVariables = definition.variables || [];
    if (templateVariables.some((variable) => !variables.has(variable)))
      throw new TypeError("MessageTemplate requires supported variables.");
    this.schemaVersion = 1;
    this.id = definition.id;
    this.title = definition.title;
    this.variables = Object.freeze([...templateVariables]);
    this.contentReference = definition.contentReference || null;
    this.provenance = cloneValue(definition.provenance || {});
    Object.freeze(this);
  }
}
