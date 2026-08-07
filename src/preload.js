import { contextBridge, ipcRenderer } from "electron";
import {
  CREDENTIAL_IPC_CHANNEL,
  CREDENTIAL_IPC_CONTRACT_VERSION,
  CredentialIPCOperation,
} from "./main/ai/credentials/CredentialIPCContract";

const invokeCredentialOperation = (operation, payload) =>
  ipcRenderer.invoke(CREDENTIAL_IPC_CHANNEL, {
    contractVersion: CREDENTIAL_IPC_CONTRACT_VERSION,
    operation,
    payload,
  });

contextBridge.exposeInMainWorld("api", {
  ping: () => ipcRenderer.invoke("app:ping"),

  loadProjects: () => ipcRenderer.invoke("projects:load"),

  saveProjects: (projects) => ipcRenderer.invoke("projects:save", projects),

  credentials: Object.freeze({
    create: (payload) =>
      invokeCredentialOperation(CredentialIPCOperation.CREATE, payload),
    replace: (payload) =>
      invokeCredentialOperation(CredentialIPCOperation.REPLACE, payload),
    remove: (payload) =>
      invokeCredentialOperation(CredentialIPCOperation.REMOVE, payload),
    listMetadata: (payload) =>
      invokeCredentialOperation(CredentialIPCOperation.LIST_METADATA, payload),
    exists: (payload) =>
      invokeCredentialOperation(CredentialIPCOperation.EXISTS, payload),
  }),
});
