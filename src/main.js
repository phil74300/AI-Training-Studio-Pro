import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";

if (started) {
  app.quit();
}

let mainWindow;

// Stockage temporaire (sera remplacé par JSON puis SQLite)
let projects = [];

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Décommente si tu veux ouvrir les outils de développement
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});

/* ==========================================
   IPC
========================================== */

ipcMain.handle("app:ping", async () => {
  return "pong";
});

ipcMain.handle("projects:load", async () => {
  return projects;
});

ipcMain.handle("projects:save", async (event, data) => {
  projects = data;
  console.log("💾 Projets sauvegardés :", projects.length);
  return true;
});

/* ==========================================
   FERMETURE
========================================== */

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});