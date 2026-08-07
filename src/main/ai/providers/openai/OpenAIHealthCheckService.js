import {
  AIProviderHealth,
  AIProviderHealthStatus,
} from "../../../../services/ai/AIProviderHealth";
import { OPENAI_PROVIDER_ID } from "../../../../services/ai/providers/openai/OpenAIModelDescriptor";
import { OpenAIConfiguration } from "../../../../services/ai/providers/openai/configuration/OpenAIConfiguration";

export const OPENAI_HEALTH_CHECK_ENDPOINT = "https://api.openai.com/v1/models";

const requireCredentialStore = (credentialStore) => {
  if (
    typeof credentialStore?.exists !== "function" ||
    typeof credentialStore?.getSecret !== "function"
  ) {
    throw new TypeError(
      "OpenAIHealthCheckService requires a trusted credential store."
    );
  }

  return credentialStore;
};

const createMetadata = (networkRequestPerformed) =>
  Object.freeze({ networkRequestPerformed });

const responseStatus = (response) =>
  Number.isInteger(response?.status) ? response.status : null;

export class OpenAIHealthCheckService {
  #credentialStore;

  #request;

  #clock;

  constructor({
    credentialStore,
    request = globalThis.fetch,
    clock = () => new Date(),
  }) {
    this.#credentialStore = requireCredentialStore(credentialStore);

    if (typeof request !== "function") {
      throw new TypeError(
        "OpenAIHealthCheckService requires an HTTP request function."
      );
    }

    if (typeof clock !== "function") {
      throw new TypeError("OpenAIHealthCheckService clock must be a function.");
    }

    this.#request = request;
    this.#clock = clock;
  }

  async check(configuration) {
    if (!(configuration instanceof OpenAIConfiguration)) {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "openai-invalid-configuration",
        false,
        "The OpenAI configuration is invalid.",
        false
      );
    }

    const credentialId = configuration.credentialReference?.credentialId;

    if (!configuration.enabled || !credentialId) {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "openai-missing-credential",
        false,
        "An available OpenAI credential is required.",
        false
      );
    }

    let secret;

    try {
      const exists = await this.#credentialStore.exists(
        OPENAI_PROVIDER_ID,
        credentialId
      );

      if (!exists) {
        return this.#failure(
          AIProviderHealthStatus.INVALID_CONFIGURATION,
          "openai-missing-credential",
          false,
          "The configured OpenAI credential is unavailable.",
          false
        );
      }

      secret = await this.#credentialStore.getSecret(
        OPENAI_PROVIDER_ID,
        credentialId
      );
    } catch {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "openai-credential-unavailable",
        false,
        "The configured OpenAI credential could not be accessed.",
        false
      );
    }

    const controller = new AbortController();
    let timeoutId;
    const timedOut = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        resolve(null);
      }, configuration.timeoutMs);
    });

    try {
      const headers = {
        Authorization: `Bearer ${secret}`,
      };

      if (configuration.organizationId) {
        headers["OpenAI-Organization"] = configuration.organizationId;
      }

      if (configuration.projectId) {
        headers["OpenAI-Project"] = configuration.projectId;
      }

      const response = await Promise.race([
        this.#request(OPENAI_HEALTH_CHECK_ENDPOINT, {
          method: "GET",
          headers,
          signal: controller.signal,
        }),
        timedOut,
      ]);

      if (response === null) {
        return this.#failure(
          AIProviderHealthStatus.TIMEOUT,
          "openai-health-check-timeout",
          true,
          "The OpenAI health check timed out.",
          true
        );
      }

      return this.#fromResponse(response);
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") {
        return this.#failure(
          AIProviderHealthStatus.TIMEOUT,
          "openai-health-check-timeout",
          true,
          "The OpenAI health check timed out.",
          true
        );
      }

      return this.#failure(
        AIProviderHealthStatus.UNREACHABLE,
        "openai-unreachable",
        true,
        "OpenAI could not be reached.",
        true
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  #fromResponse(response) {
    const status = responseStatus(response);

    if (status !== null && status >= 200 && status < 300) {
      return AIProviderHealth.available({
        providerId: OPENAI_PROVIDER_ID,
        checkedAt: this.#clock(),
        metadata: createMetadata(true),
      });
    }

    if (status === 401) {
      return this.#failure(
        AIProviderHealthStatus.UNAUTHORIZED,
        "openai-unauthorized",
        false,
        "The OpenAI credential was not accepted.",
        true
      );
    }

    if (status === 403) {
      return this.#failure(
        AIProviderHealthStatus.FORBIDDEN,
        "openai-forbidden",
        false,
        "Access to OpenAI is forbidden for this credential or location.",
        true
      );
    }

    if (status === 408 || status === 504) {
      return this.#failure(
        AIProviderHealthStatus.TIMEOUT,
        "openai-health-check-timeout",
        true,
        "The OpenAI health check timed out.",
        true
      );
    }

    const retryable = status === 429 || (status !== null && status >= 500);

    return this.#failure(
      AIProviderHealthStatus.UNKNOWN_ERROR,
      status === 429 ? "openai-rate-limited" : "openai-health-check-failed",
      retryable,
      "OpenAI returned an unexpected health-check response.",
      true
    );
  }

  #failure(status, code, retryable, message, networkRequestPerformed) {
    return AIProviderHealth.failed({
      providerId: OPENAI_PROVIDER_ID,
      status,
      checkedAt: this.#clock(),
      error: { code, retryable, message },
      metadata: createMetadata(networkRequestPerformed),
    });
  }
}
