const abstractMethod = (method) => {
  throw new Error(`CredentialStoreAdapter.${method}() must be implemented.`);
};

export const CREDENTIAL_STORE_ADAPTER_METHODS = Object.freeze([
  "createCredential",
  "replaceCredential",
  "removeCredential",
  "exists",
  "listMetadata",
  "getSecret",
]);

export class CredentialStoreAdapter {
  createCredential(metadata, secret) {
    return abstractMethod("createCredential", metadata, secret);
  }

  replaceCredential(metadata, secret) {
    return abstractMethod("replaceCredential", metadata, secret);
  }

  removeCredential(providerId, credentialId) {
    return abstractMethod("removeCredential", providerId, credentialId);
  }

  exists(providerId, credentialId) {
    return abstractMethod("exists", providerId, credentialId);
  }

  listMetadata(providerId) {
    return abstractMethod("listMetadata", providerId);
  }

  getSecret(providerId, credentialId) {
    return abstractMethod("getSecret", providerId, credentialId);
  }
}

export const isCredentialStoreAdapter = (adapter) =>
  CREDENTIAL_STORE_ADAPTER_METHODS.every(
    (method) => typeof adapter?.[method] === "function"
  );
