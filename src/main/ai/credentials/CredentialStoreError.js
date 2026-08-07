export const CredentialStoreErrorCode = Object.freeze({
  NOT_FOUND: "credential-not-found",
  DUPLICATE: "credential-already-exists",
  PERMISSION_DENIED: "credential-permission-denied",
  KEYCHAIN_UNAVAILABLE: "keychain-unavailable",
  UNSUPPORTED_PLATFORM: "unsupported-platform",
  STORAGE_FAILURE: "credential-storage-failed",
});

const messages = Object.freeze({
  [CredentialStoreErrorCode.NOT_FOUND]: "The credential was not found.",
  [CredentialStoreErrorCode.DUPLICATE]: "The credential already exists.",
  [CredentialStoreErrorCode.PERMISSION_DENIED]:
    "Credential-store access was denied.",
  [CredentialStoreErrorCode.KEYCHAIN_UNAVAILABLE]:
    "The platform credential store is unavailable.",
  [CredentialStoreErrorCode.UNSUPPORTED_PLATFORM]:
    "Native credential storage is not supported on this platform.",
  [CredentialStoreErrorCode.STORAGE_FAILURE]:
    "The credential-store operation failed.",
});

const nativeErrorPatterns = Object.freeze([
  Object.freeze({
    code: CredentialStoreErrorCode.NOT_FOUND,
    pattern: /no entry|not found|does not exist/i,
  }),
  Object.freeze({
    code: CredentialStoreErrorCode.PERMISSION_DENIED,
    pattern: /permission|denied|not allowed|user canceled|interaction/i,
  }),
  Object.freeze({
    code: CredentialStoreErrorCode.KEYCHAIN_UNAVAILABLE,
    pattern: /keychain.*unavailable|secure storage.*unavailable|no backend/i,
  }),
]);

export class CredentialStoreError extends Error {
  constructor(code) {
    if (!Object.hasOwn(messages, code)) {
      throw new TypeError(`Unsupported credential-store error code: ${code}`);
    }

    super(messages[code]);
    this.name = "CredentialStoreError";
    this.code = code;
  }
}

export const normalizeCredentialStoreError = (
  error,
  fallbackCode = CredentialStoreErrorCode.STORAGE_FAILURE
) => {
  if (error instanceof CredentialStoreError) {
    return error;
  }

  const nativeMessage = error instanceof Error ? error.message : "";
  const match = nativeErrorPatterns.find(({ pattern }) =>
    pattern.test(nativeMessage)
  );

  return new CredentialStoreError(match?.code || fallbackCode);
};

export const toPublicCredentialStoreError = (error) => {
  const normalized = normalizeCredentialStoreError(error);

  return Object.freeze({
    code: normalized.code,
    field: "operation",
    message: normalized.message,
  });
};
