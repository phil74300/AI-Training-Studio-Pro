import { OpenAIConfigurationDescriptor } from "./OpenAIConfigurationDescriptor";
import { OpenAIConfigurationValidator } from "./OpenAIConfigurationValidator";
import { OPENAI_PROVIDER_ID } from "../OpenAIModelDescriptor";

const sourceMethods = Object.freeze(["loadConfiguration"]);

const defaultConfigurationSource = Object.freeze({
  loadConfiguration: async () => null,
});

const isConfigurationSource = (source) =>
  sourceMethods.every((method) => typeof source?.[method] === "function");

const createServiceResult = ({ loaded, descriptor, errors = [] }) =>
  Object.freeze({
    loaded,
    descriptor,
    errors: Object.freeze([...errors]),
  });

export class OpenAIConfigurationService {
  #source;

  #validator;

  #configuration = null;

  constructor({
    source = defaultConfigurationSource,
    validator = new OpenAIConfigurationValidator(),
  } = {}) {
    if (!isConfigurationSource(source)) {
      throw new TypeError(
        "OpenAIConfigurationService requires a configuration source contract."
      );
    }

    if (typeof validator?.validate !== "function") {
      throw new TypeError(
        "OpenAIConfigurationService requires a configuration validator contract."
      );
    }

    this.#source = source;
    this.#validator = validator;
  }

  async loadConfiguration() {
    const candidate = await this.#source.loadConfiguration(OPENAI_PROVIDER_ID);

    if (candidate === null || candidate === undefined) {
      this.#configuration = null;

      return createServiceResult({
        loaded: false,
        descriptor: this.getDescriptor(),
      });
    }

    const validation = this.#validator.validate(candidate);

    if (!validation.valid) {
      this.#configuration = null;

      return createServiceResult({
        loaded: false,
        descriptor: this.getDescriptor(),
        errors: validation.errors,
      });
    }

    this.#configuration = validation.configuration;

    return createServiceResult({
      loaded: true,
      descriptor: this.getDescriptor(),
    });
  }

  validateConfiguration(candidate) {
    const validation = this.#validator.validate(candidate);

    return Object.freeze({
      valid: validation.valid,
      errors: validation.errors,
      descriptor: validation.valid
        ? OpenAIConfigurationDescriptor.fromConfiguration(
            validation.configuration
          )
        : new OpenAIConfigurationDescriptor(),
    });
  }

  getDescriptor() {
    return this.#configuration
      ? OpenAIConfigurationDescriptor.fromConfiguration(this.#configuration)
      : new OpenAIConfigurationDescriptor();
  }
}
