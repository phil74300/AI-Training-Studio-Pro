import { GeminiConfigurationDescriptor } from "./GeminiConfigurationDescriptor";
import { GeminiConfigurationValidator } from "./GeminiConfigurationValidator";
import { GEMINI_PROVIDER_ID } from "../GeminiModelDescriptor";

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

export class GeminiConfigurationService {
  #source;

  #validator;

  #configuration = null;

  constructor({
    source = defaultConfigurationSource,
    validator = new GeminiConfigurationValidator(),
  } = {}) {
    if (!isConfigurationSource(source)) {
      throw new TypeError(
        "GeminiConfigurationService requires a configuration source contract."
      );
    }

    if (typeof validator?.validate !== "function") {
      throw new TypeError(
        "GeminiConfigurationService requires a configuration validator contract."
      );
    }

    this.#source = source;
    this.#validator = validator;
  }

  async loadConfiguration() {
    const candidate = await this.#source.loadConfiguration(GEMINI_PROVIDER_ID);

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
        ? GeminiConfigurationDescriptor.fromConfiguration(
            validation.configuration
          )
        : new GeminiConfigurationDescriptor(),
    });
  }

  getDescriptor() {
    return this.#configuration
      ? GeminiConfigurationDescriptor.fromConfiguration(this.#configuration)
      : new GeminiConfigurationDescriptor();
  }
}
