import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {

  ping: () =>
    ipcRenderer.invoke("app:ping"),

  loadProjects: () =>
    ipcRenderer.invoke("projects:load"),

  saveProjects: (projects) =>
    ipcRenderer.invoke("projects:save", projects)

});