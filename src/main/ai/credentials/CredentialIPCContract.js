import { CredentialMetadata } from "./CredentialMetadata";
import { toPublicCredentialStoreError } from "./CredentialStoreError";

export const CREDENTIAL_IPC_CONTRACT_VERSION = 1;
export const CREDENTIAL_IPC_CHANNEL = "ai:credentials:v1";

export const CredentialIPCOperation = Object.freeze({
  CREATE: "create-credential",
  REPLACE: "replace-credential",
  REMOVE: "remove-credential",
  LIST_METADATA: "list-credential-metadata",
  EXISTS: "credential-exists",
});

const serviceMethods = Object.freeze([
  "createCredential",
  "replaceCredential",
  "removeCredential",
  "listCredentialMetadata",
  "credentialExists",
]);

const createResponse = ({ operation, ok, result = null, errors = [] }) =>
  Object.freeze({
    contractVersion: CREDENTIAL_IPC_CONTRACT_VERSION,
    operation,
    ok,
    result,
    errors: Object.freeze([...errors]),
  });

const operationHandlers = Object.freeze({
  [CredentialIPCOperation.CREATE]: "createCredential",
  [CredentialIPCOperation.REPLACE]: "replaceCredential",
  [CredentialIPCOperation.REMOVE]: "removeCredential",
  [CredentialIPCOperation.LIST_METADATA]: "listCredentialMetadata",
  [CredentialIPCOperation.EXISTS]: "credentialExists",
});

const requireBoolean = (value, field) => {
  if (typeof value !== "boolean") {
    throw new TypeError(`${field} must be a boolean.`);
  }

  return value;
};

const normalizeIPCResult = (operation, payload, result) => {
  if (
    operation === CredentialIPCOperation.CREATE ||
    operation === CredentialIPCOperation.REPLACE
  ) {
    return CredentialMetadata.from(result).toPublicRecord();
  }

  if (operation === CredentialIPCOperation.LIST_METADATA) {
    if (!Array.isArray(result)) {
      throw new TypeError("Credential metadata result must be an array.");
    }

    return Object.freeze(
      result.map((metadata) =>
        CredentialMetadata.from(metadata).toPublicRecord()
      )
    );
  }

  if (operation === CredentialIPCOperation.REMOVE) {
    return Object.freeze({
      providerId: payload.providerId,
      credentialId: payload.credentialId,
      removed: requireBoolean(result?.removed, "removed"),
    });
  }

  return Object.freeze({
    providerId: payload.providerId,
    credentialId: payload.credentialId,
    exists: requireBoolean(result?.exists, "exists"),
  });
};

export const createCredentialIPCHandler = ({ service, validator }) => {
  if (
    !serviceMethods.every((method) => typeof service?.[method] === "function")
  ) {
    throw new TypeError("Credential IPC handler requires a service contract.");
  }

  if (typeof validator?.validate !== "function") {
    throw new TypeError(
      "Credential IPC handler requires a validator contract."
    );
  }

  return async (_event, message) => {
    const validation = validator.validate(message);
    const operation =
      typeof message?.operation === "string" ? message.operation : null;

    if (!validation.valid) {
      return createResponse({
        operation,
        ok: false,
        errors: validation.errors,
      });
    }

    try {
      const method = operationHandlers[validation.message.operation];
      const serviceResult = await service[method](validation.message.payload);
      const result = normalizeIPCResult(
        validation.message.operation,
        validation.message.payload,
        serviceResult
      );

      return createResponse({
        operation: validation.message.operation,
        ok: true,
        result,
      });
    } catch (error) {
      return createResponse({
        operation: validation.message.operation,
        ok: false,
        errors: [toPublicCredentialStoreError(error)],
      });
    }
  };
};

export const registerCredentialIPC = ({ ipcMain, service, validator }) => {
  if (
    typeof ipcMain?.handle !== "function" ||
    typeof ipcMain?.removeHandler !== "function"
  ) {
    throw new TypeError("Credential IPC registration requires ipcMain.");
  }

  const handler = createCredentialIPCHandler({ service, validator });

  ipcMain.handle(CREDENTIAL_IPC_CHANNEL, handler);

  return () => ipcMain.removeHandler(CREDENTIAL_IPC_CHANNEL);
};
