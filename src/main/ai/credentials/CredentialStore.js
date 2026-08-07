import { CredentialMetadata } from "./CredentialMetadata";
import { isCredentialStoreAdapter } from "./CredentialStoreAdapter";

const requireSecret = (secret) => {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new TypeError("Credential secret must be a non-empty string.");
  }

  return secret;
};

const normalizeBoolean = (value, field) => {
  if (typeof value !== "boolean") {
    throw new TypeError(`${field} must return a boolean.`);
  }

  return value;
};

export class CredentialStore {
  #adapter;

  constructor(adapter) {
    if (!isCredentialStoreAdapter(adapter)) {
      throw new TypeError("CredentialStore requires a store adapter contract.");
    }

    this.#adapter = adapter;
  }

  async createCredential(metadata, secret) {
    const normalizedMetadata = CredentialMetadata.from(metadata);
    const storedMetadata = await this.#adapter.createCredential(
      normalizedMetadata,
      requireSecret(secret)
    );

    return CredentialMetadata.from(storedMetadata);
  }

  async replaceCredential(metadata, secret) {
    const normalizedMetadata = CredentialMetadata.from(metadata);
    const storedMetadata = await this.#adapter.replaceCredential(
      normalizedMetadata,
      requireSecret(secret)
    );

    return CredentialMetadata.from(storedMetadata);
  }

  async removeCredential(providerId, credentialId) {
    return normalizeBoolean(
      await this.#adapter.removeCredential(providerId, credentialId),
      "CredentialStoreAdapter.removeCredential"
    );
  }

  async exists(providerId, credentialId) {
    return normalizeBoolean(
      await this.#adapter.exists(providerId, credentialId),
      "CredentialStoreAdapter.exists"
    );
  }

  async listMetadata(providerId) {
    const metadata = await this.#adapter.listMetadata(providerId);

    if (!Array.isArray(metadata)) {
      throw new TypeError(
        "CredentialStoreAdapter.listMetadata must return an array."
      );
    }

    return Object.freeze(metadata.map((item) => CredentialMetadata.from(item)));
  }

  async getSecret(providerId, credentialId) {
    const secret = await this.#adapter.getSecret(providerId, credentialId);

    return requireSecret(secret);
  }
}
