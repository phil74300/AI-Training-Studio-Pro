import {
  AIProviderHealth,
  AIProviderHealthStatus,
} from "../../../../services/ai/AIProviderHealth";
import { GEMINI_PROVIDER_ID } from "../../../../services/ai/providers/gemini/GeminiModelDescriptor";
import { GeminiConfiguration } from "../../../../services/ai/providers/gemini/configuration/GeminiConfiguration";

export const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

const requireCredentialStore = (credentialStore) => {
  if (
    typeof credentialStore?.exists !== "function" ||
    typeof credentialStore?.getSecret !== "function"
  ) {
    throw new TypeError(
      "GeminiHealthCheckService requires a trusted credential store."
    );
  }

  return credentialStore;
};

const createMetadata = (networkRequestPerformed) =>
  Object.freeze({ networkRequestPerformed });

const responseStatus = (response) =>
  Number.isInteger(response?.status) ? response.status : null;

export class GeminiHealthCheckService {
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
        "GeminiHealthCheckService requires an HTTP request function."
      );
    }

    if (typeof clock !== "function") {
      throw new TypeError("GeminiHealthCheckService clock must be a function.");
    }

    this.#request = request;
    this.#clock = clock;
  }

  async check(configuration) {
    if (!(configuration instanceof GeminiConfiguration)) {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "gemini-invalid-configuration",
        false,
        "The Gemini configuration is invalid.",
        false
      );
    }

    const credentialId = configuration.credentialReference?.credentialId;

    if (!configuration.enabled || !credentialId) {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "gemini-missing-credential",
        false,
        "An available Gemini credential is required.",
        false
      );
    }

    let secret;

    try {
      const exists = await this.#credentialStore.exists(
        GEMINI_PROVIDER_ID,
        credentialId
      );

      if (!exists) {
        return this.#failure(
          AIProviderHealthStatus.INVALID_CONFIGURATION,
          "gemini-missing-credential",
          false,
          "The configured Gemini credential is unavailable.",
          false
        );
      }

      secret = await this.#credentialStore.getSecret(
        GEMINI_PROVIDER_ID,
        credentialId
      );
    } catch {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "gemini-credential-unavailable",
        false,
        "The configured Gemini credential could not be accessed.",
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
      const endpoint = `${GEMINI_API_BASE_URL}/models/${encodeURIComponent(
        configuration.defaultModel
      )}`;
      const response = await Promise.race([
        this.#request(endpoint, {
          method: "GET",
          headers: { "x-goog-api-key": secret },
          signal: controller.signal,
        }),
        timedOut,
      ]);

      if (response === null) {
        return this.#failure(
          AIProviderHealthStatus.TIMEOUT,
          "gemini-health-check-timeout",
          true,
          "The Gemini health check timed out.",
          true
        );
      }

      return this.#fromResponse(response);
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") {
        return this.#failure(
          AIProviderHealthStatus.TIMEOUT,
          "gemini-health-check-timeout",
          true,
          "The Gemini health check timed out.",
          true
        );
      }

      return this.#failure(
        AIProviderHealthStatus.UNREACHABLE,
        "gemini-unreachable",
        true,
        "Gemini could not be reached.",
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
        providerId: GEMINI_PROVIDER_ID,
        checkedAt: this.#clock(),
        metadata: createMetadata(true),
      });
    }

    if (status === 400) {
      return this.#failure(
        AIProviderHealthStatus.INVALID_CONFIGURATION,
        "gemini-invalid-configuration",
        false,
        "Gemini rejected the configured model or request.",
        true
      );
    }

    if (status === 401) {
      return this.#failure(
        AIProviderHealthStatus.UNAUTHORIZED,
        "gemini-unauthorized",
        false,
        "The Gemini credential was not accepted.",
        true
      );
    }

    if (status === 403) {
      return this.#failure(
        AIProviderHealthStatus.FORBIDDEN,
        "gemini-forbidden",
        false,
        "Access to Gemini is forbidden for this credential or location.",
        true
      );
    }

    if (status === 408 || status === 504) {
      return this.#failure(
        AIProviderHealthStatus.TIMEOUT,
        "gemini-health-check-timeout",
        true,
        "The Gemini health check timed out.",
        true
      );
    }

    const retryable = status === 429 || (status !== null && status >= 500);

    return this.#failure(
      AIProviderHealthStatus.UNKNOWN_ERROR,
      status === 429 ? "gemini-rate-limited" : "gemini-health-check-failed",
      retryable,
      "Gemini returned an unexpected health-check response.",
      true
    );
  }

  #failure(status, code, retryable, message, networkRequestPerformed) {
    return AIProviderHealth.failed({
      providerId: GEMINI_PROVIDER_ID,
      status,
      checkedAt: this.#clock(),
      error: { code, retryable, message },
      metadata: createMetadata(networkRequestPerformed),
    });
  }
}
