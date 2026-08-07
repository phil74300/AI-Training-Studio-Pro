import { PromptTemplate } from "./PromptTemplate";

export class PromptRegistry {
  #templates = new Map();

  #templatesByAction = new Map();

  constructor(templates = []) {
    templates.forEach((template) => this.register(template));
  }

  register(template) {
    const normalizedTemplate =
      template instanceof PromptTemplate
        ? template
        : new PromptTemplate(template);

    if (this.#templates.has(normalizedTemplate.id)) {
      throw new Error(
        `Prompt template already registered: ${normalizedTemplate.id}`
      );
    }

    this.#templates.set(normalizedTemplate.id, normalizedTemplate);

    const actionTemplates =
      this.#templatesByAction.get(normalizedTemplate.supportedAction) || [];

    this.#templatesByAction.set(
      normalizedTemplate.supportedAction,
      Object.freeze([...actionTemplates, normalizedTemplate])
    );

    return normalizedTemplate;
  }

  get(templateId) {
    return this.#templates.get(templateId) || null;
  }

  require(templateId) {
    const template = this.get(templateId);

    if (!template) {
      throw new Error(`Unknown prompt template: ${templateId}`);
    }

    return template;
  }

  getByAction(actionId) {
    return this.#templatesByAction.get(actionId) || Object.freeze([]);
  }

  list() {
    return Object.freeze([...this.#templates.values()]);
  }
}
