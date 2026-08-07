import { AsyncEntry, findCredentialsAsync } from "@napi-rs/keyring";
import { CredentialMetadata } from "./CredentialMetadata";
import { CredentialStoreAdapter } from "./CredentialStoreAdapter";
import {
  CredentialStoreError,
  CredentialStoreErrorCode,
  normalizeCredentialStoreError,
} from "./CredentialStoreError";

export const MACOS_KEYCHAIN_APPLICATION_ID = "com.ai-training-studio-pro";

const defaultKeyring = Object.freeze({ AsyncEntry, findCredentialsAsync });

const requireKeyring = (keyring) => {
  if (
    typeof keyring?.AsyncEntry !== "function" ||
    typeof keyring?.findCredentialsAsync !== "function"
  ) {
    throw new TypeError(
      "MacOSKeychainCredentialStoreAdapter requires a keyring contract."
    );
  }

  return keyring;
};

const requireSecret = (secret) => {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new TypeError("Credential secret must be a non-empty string.");
  }

  return secret;
};

const encodeIdentifier = (value) => encodeURIComponent(value);

const secretService = (providerId) =>
  `${MACOS_KEYCHAIN_APPLICATION_ID}.ai-credential.${encodeIdentifier(providerId)}`;

const metadataService = (providerId) =>
  `${MACOS_KEYCHAIN_APPLICATION_ID}.ai-credential-metadata.${encodeIdentifier(providerId)}`;

const credentialAccount = (credentialId) =>
  `credential.${encodeIdentifier(credentialId)}`;

const parseMetadata = (serialized) => {
  try {
    return CredentialMetadata.from(JSON.parse(serialized));
  } catch {
    throw new CredentialStoreError(CredentialStoreErrorCode.STORAGE_FAILURE);
  }
};

export class MacOSKeychainCredentialStoreAdapter extends CredentialStoreAdapter {
  #keyring;

  #operationQueue = Promise.resolve();

  constructor({ platform = process.platform, keyring = defaultKeyring } = {}) {
    super();

    if (platform !== "darwin") {
      throw new CredentialStoreError(
        CredentialStoreErrorCode.UNSUPPORTED_PLATFORM
      );
    }

    this.#keyring = requireKeyring(keyring);
  }

  createCredential(metadata, secret) {
    return this.#serialize(async () => {
      const normalizedMetadata = CredentialMetadata.from(metadata);
      const normalizedSecret = requireSecret(secret);
      const secretEntry = this.#secretEntry(normalizedMetadata);

      if ((await this.#readPassword(secretEntry)) !== null) {
        throw new CredentialStoreError(CredentialStoreErrorCode.DUPLICATE);
      }

      try {
        await secretEntry.setPassword(normalizedSecret);
        await this.#metadataEntry(normalizedMetadata).setPassword(
          JSON.stringify(normalizedMetadata.toPublicRecord())
        );
      } catch (error) {
        await this.#deleteIgnoringMissing(secretEntry);
        throw normalizeCredentialStoreError(error);
      }

      return normalizedMetadata;
    });
  }

  replaceCredential(metadata, secret) {
    return this.#serialize(async () => {
      const normalizedMetadata = CredentialMetadata.from(metadata);
      const normalizedSecret = requireSecret(secret);
      const secretEntry = this.#secretEntry(normalizedMetadata);
      const previousSecret = await this.#readPassword(secretEntry);

      if (previousSecret === null) {
        throw new CredentialStoreError(CredentialStoreErrorCode.NOT_FOUND);
      }

      try {
        await secretEntry.setPassword(normalizedSecret);
        await this.#metadataEntry(normalizedMetadata).setPassword(
          JSON.stringify(normalizedMetadata.toPublicRecord())
        );
      } catch (error) {
        try {
          await secretEntry.setPassword(previousSecret);
        } catch {
          throw new CredentialStoreError(
            CredentialStoreErrorCode.STORAGE_FAILURE
          );
        }

        throw normalizeCredentialStoreError(error);
      }

      return normalizedMetadata;
    });
  }

  removeCredential(providerId, credentialId) {
    return this.#serialize(async () => {
      const secretEntry = this.#entry(
        secretService(providerId),
        credentialAccount(credentialId)
      );
      const metadataEntry = this.#entry(
        metadataService(providerId),
        credentialAccount(credentialId)
      );

      try {
        const secretRemoved = await this.#deleteIgnoringMissing(secretEntry);
        const metadataRemoved =
          await this.#deleteIgnoringMissing(metadataEntry);

        return secretRemoved || metadataRemoved;
      } catch (error) {
        throw normalizeCredentialStoreError(error);
      }
    });
  }

  exists(providerId, credentialId) {
    return this.#serialize(async () => {
      const entry = this.#entry(
        secretService(providerId),
        credentialAccount(credentialId)
      );

      return (await this.#readPassword(entry)) !== null;
    });
  }

  listMetadata(providerId) {
    return this.#serialize(async () => {
      try {
        const credentials = await this.#keyring.findCredentialsAsync(
          metadataService(providerId)
        );

        if (!Array.isArray(credentials)) {
          throw new CredentialStoreError(
            CredentialStoreErrorCode.STORAGE_FAILURE
          );
        }

        return Object.freeze(
          credentials
            .map(({ password }) => parseMetadata(password))
            .filter((metadata) => metadata.providerId === providerId)
            .sort((left, right) =>
              left.credentialId.localeCompare(right.credentialId)
            )
        );
      } catch (error) {
        throw normalizeCredentialStoreError(error);
      }
    });
  }

  getSecret(providerId, credentialId) {
    return this.#serialize(async () => {
      const entry = this.#entry(
        secretService(providerId),
        credentialAccount(credentialId)
      );
      const secret = await this.#readPassword(entry);

      if (secret === null) {
        throw new CredentialStoreError(CredentialStoreErrorCode.NOT_FOUND);
      }

      return secret;
    });
  }

  #secretEntry(metadata) {
    return this.#entry(
      secretService(metadata.providerId),
      credentialAccount(metadata.credentialId)
    );
  }

  #metadataEntry(metadata) {
    return this.#entry(
      metadataService(metadata.providerId),
      credentialAccount(metadata.credentialId)
    );
  }

  #entry(service, account) {
    return new this.#keyring.AsyncEntry(service, account);
  }

  async #readPassword(entry) {
    try {
      return (await entry.getPassword()) ?? null;
    } catch (error) {
      const normalized = normalizeCredentialStoreError(error);

      if (normalized.code === CredentialStoreErrorCode.NOT_FOUND) {
        return null;
      }

      throw normalized;
    }
  }

  async #deleteIgnoringMissing(entry) {
    try {
      return (await entry.deleteCredential()) === true;
    } catch (error) {
      const normalized = normalizeCredentialStoreError(error);

      if (normalized.code === CredentialStoreErrorCode.NOT_FOUND) {
        return false;
      }

      throw normalized;
    }
  }

  #serialize(operation) {
    const result = this.#operationQueue.then(operation, operation);

    this.#operationQueue = result.catch(() => undefined);

    return result;
  }
}
