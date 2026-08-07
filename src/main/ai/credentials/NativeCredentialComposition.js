import { CredentialIPCValidator } from "./CredentialIPCValidator";
import { registerCredentialIPC } from "./CredentialIPCContract";
import { CredentialStore } from "./CredentialStore";
import { CredentialStoreAdapter } from "./CredentialStoreAdapter";
import {
  CredentialStoreError,
  CredentialStoreErrorCode,
} from "./CredentialStoreError";
import { CredentialStoreService } from "./CredentialStoreService";
import { MacOSKeychainCredentialStoreAdapter } from "./MacOSKeychainCredentialStoreAdapter";

class UnsupportedPlatformCredentialStoreAdapter extends CredentialStoreAdapter {
  createCredential() {
    return this.#unsupported();
  }

  replaceCredential() {
    return this.#unsupported();
  }

  removeCredential() {
    return this.#unsupported();
  }

  exists() {
    return this.#unsupported();
  }

  listMetadata() {
    return this.#unsupported();
  }

  getSecret() {
    return this.#unsupported();
  }

  #unsupported() {
    throw new CredentialStoreError(
      CredentialStoreErrorCode.UNSUPPORTED_PLATFORM
    );
  }
}

const createPlatformAdapter = ({ platform, keyring }) =>
  platform === "darwin"
    ? new MacOSKeychainCredentialStoreAdapter({ platform, keyring })
    : new UnsupportedPlatformCredentialStoreAdapter();

export const createNativeCredentialInfrastructure = ({
  ipcMain,
  platform = process.platform,
  keyring,
  clock = () => new Date(),
}) => {
  const adapter = createPlatformAdapter({ platform, keyring });
  const credentialStore = new CredentialStore(adapter);
  const credentialStoreService = new CredentialStoreService({
    store: credentialStore,
    clock,
  });
  const validator = new CredentialIPCValidator({
    supportedProviderIds: ["openai"],
  });
  const dispose = registerCredentialIPC({
    ipcMain,
    service: credentialStoreService,
    validator,
  });

  return Object.freeze({ credentialStore, dispose });
};
