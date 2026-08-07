import {
  CredentialMetadata,
  CredentialMetadataStatus,
} from "./CredentialMetadata";
import { CredentialStore } from "./CredentialStore";

const requireStore = (store) => {
  const methods = [
    "createCredential",
    "replaceCredential",
    "removeCredential",
    "exists",
    "listMetadata",
  ];

  if (!methods.every((method) => typeof store?.[method] === "function")) {
    throw new TypeError("CredentialStoreService requires a store contract.");
  }

  return store;
};

const normalizeTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(
      "CredentialStoreService clock must return a valid date."
    );
  }

  return date.toISOString();
};

const createOperationResult = (values) => Object.freeze({ ...values });

export class CredentialStoreService {
  #store;

  #clock;

  constructor({ store, clock = () => new Date() }) {
    this.#store = requireStore(store);

    if (typeof clock !== "function") {
      throw new TypeError("CredentialStoreService clock must be a function.");
    }

    this.#clock = clock;
  }

  async createCredential({ providerId, credentialId, displayName, secret }) {
    if (await this.#store.exists(providerId, credentialId)) {
      throw new Error("Credential already exists.");
    }

    const timestamp = this.#now();
    const metadata = new CredentialMetadata({
      credentialId,
      providerId,
      displayName,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: CredentialMetadataStatus.AVAILABLE,
    });
    const storedMetadata = await this.#store.createCredential(metadata, secret);

    return storedMetadata.toPublicRecord();
  }

  async replaceCredential({ providerId, credentialId, displayName, secret }) {
    const metadata = await this.#findMetadata(providerId, credentialId);

    if (!metadata) {
      throw new Error("Credential does not exist.");
    }

    const replacement = new CredentialMetadata({
      credentialId,
      providerId,
      displayName,
      createdAt: metadata.createdAt,
      updatedAt: this.#now(),
      status: CredentialMetadataStatus.AVAILABLE,
    });
    const storedMetadata = await this.#store.replaceCredential(
      replacement,
      secret
    );

    return storedMetadata.toPublicRecord();
  }

  async removeCredential({ providerId, credentialId }) {
    const removed = await this.#store.removeCredential(
      providerId,
      credentialId
    );

    return createOperationResult({ providerId, credentialId, removed });
  }

  async credentialExists({ providerId, credentialId }) {
    const exists = await this.#store.exists(providerId, credentialId);

    return createOperationResult({ providerId, credentialId, exists });
  }

  async listCredentialMetadata({ providerId }) {
    const metadata = await this.#store.listMetadata(providerId);

    return Object.freeze(metadata.map((item) => item.toPublicRecord()));
  }

  async #findMetadata(providerId, credentialId) {
    const metadata = await this.#store.listMetadata(providerId);

    return metadata.find((item) => item.credentialId === credentialId) || null;
  }

  #now() {
    return normalizeTimestamp(this.#clock());
  }
}

export const createCredentialStoreService = (adapter, options = {}) =>
  new CredentialStoreService({
    ...options,
    store: new CredentialStore(adapter),
  });
