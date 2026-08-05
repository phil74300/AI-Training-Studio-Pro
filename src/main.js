import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";

if (started) {
  app.quit();
}

let mainWindow;
let projects = [];

// ================================
// Emplacement du fichier JSON
// ================================

const dataDir = app.getPath("userData");

const projectsFile = path.join(
  dataDir,
  "projects.json"
);
console.log("📂 projects.json :", projectsFile);
// ================================
// Chargement des projets
// ================================

function loadProjectsFromDisk() {

  try {

    if (!fs.existsSync(projectsFile)) {

  fs.mkdirSync(dataDir, {
    recursive: true
  });

  fs.writeFileSync(
    projectsFile,
    "[]",
    "utf8"
  );

  projects = [];

  console.log("📄 Création de :", projectsFile);

  return;

}

    const json = fs.readFileSync(
      projectsFile,
      "utf8"
    );

    projects = JSON.parse(json);

    if (!Array.isArray(projects)) {
      projects = [];
    }

    console.log(
      "📂",
      projects.length,
      "projet(s) chargé(s)"
    );

  } catch (error) {

    console.error(
      "Erreur chargement projets :",
      error
    );

    projects = [];

  }

}

// ================================
// Sauvegarde
// ================================

function saveProjectsToDisk() {

  try {

    fs.writeFileSync(

      projectsFile,

      JSON.stringify(
        projects,
        null,
        2
      ),

      "utf8"

    );

    console.log(
      "💾",
      projects.length,
      "projet(s) sauvegardé(s)"
    );

  } catch (error) {

    console.error(
      "Erreur sauvegarde :",
      error
    );

  }

}

// ================================
// Fenêtre principale
// ================================

function createWindow() {

  mainWindow = new BrowserWindow({

    width: 1600,
    height: 900,

    minWidth: 1200,
    minHeight: 700,

    show: false,

    autoHideMenuBar: true,

    webPreferences: {

      preload: path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation: true,

      nodeIntegration: false

    }

  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {

    mainWindow.loadURL(
      MAIN_WINDOW_VITE_DEV_SERVER_URL
    );

  } else {

    mainWindow.loadFile(

      path.join(

        __dirname,

        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`

      )

    );

  }

  mainWindow.once(
    "ready-to-show",
    () => mainWindow.show()
  );

}
// =================================
// Initialisation
// =================================

app.whenReady().then(() => {

  // Chargement des projets au démarrage
  loadProjectsFromDisk();

  createWindow();

  app.on("activate", () => {

    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }

  });

});

// =================================
// IPC
// =================================

ipcMain.handle("app:ping", async () => {

  return "pong";

});

ipcMain.handle("projects:load", async () => {

  return projects;

});

ipcMain.handle("projects:save", async (event, data) => {

  projects = Array.isArray(data)
    ? data
    : [];

  saveProjectsToDisk();

  return true;

});

// =================================
// Fermeture
// =================================

app.on("window-all-closed", () => {

  if (process.platform !== "darwin") {
    app.quit();
  }

});