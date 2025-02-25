import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from 'path';
import testdata from './testdata';
import * as settings from 'electron-settings';
import "reflect-metadata";
import { initializeDatabase } from './datasource';
import { setIPCHandlers } from "./handlers";

const { updateElectronApp } = require('update-electron-app');
if (app.isPackaged)
  updateElectronApp();



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}


let mainWindow: BrowserWindow | null;
settings.configure({
  fileName: 'app-settings.json',
  dir: app.isPackaged ? process.resourcesPath : __dirname
});


const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  const startURL = app.isPackaged ?
    `file://${path.join(__dirname, 'biuro-app', 'browser', 'index.html')}`
    : `http://localhost:4200`;

  mainWindow.loadURL(startURL);

  maximize();
  if (!app.isPackaged)
    mainWindow.webContents.openDevTools();
};

const setupDatabase = async () => {
  let config: any = {};

  if (app.isPackaged) {
    let dbsettings: any = settings.getSync('database')
    config.port = dbsettings.port;
    config.host = dbsettings.host;
    config.username = dbsettings.username;
    config.password = dbsettings.password;
    config.database = dbsettings.database;
    config.logging = false;
  }

  await initializeDatabase(config).then(() => {
    console.log('Connected to Postgres');
  })
    .catch(err => console.error('Error:', err));

  if (!app.isPackaged)
    await testdata.populate();
}

const setAppHandlers = () => {
  ipcMain.handle('app:minimize', () => minimize());
  ipcMain.handle('app:maximize', () => maximize());
  ipcMain.handle('app:close', () => close());
  ipcMain.handle('app:resize', () => resize());
  ipcMain.handle('app:toggleDevTools', () => toggleDevTools());
  ipcMain.handle('app:setTitle', (e, title: string) => setTitle(title));

  ipcMain.handle('app:getLastUserName', () => settings.getSync('lastUserName'));
  ipcMain.handle('app:getAppSettings', (e, key: string) => getSettings(key));
  ipcMain.handle('app:setAppSettings', (e, key: string, value: string) => setSettings(key, value));

  ipcMain.handle('app:getVersion', () => app.getVersion());

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  await setupDatabase();
  createWindow();
  setAppHandlers();
  setIPCHandlers();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== 'darwin') {
    app.quit();

  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


function minimize(): any {
  mainWindow.unmaximize();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.setSize(400, 100, true);
  mainWindow.setResizable(false);
}

function maximize(): any {
  mainWindow.setResizable(true);
  mainWindow.setAlwaysOnTop(false);
  mainWindow.maximize();
  mainWindow.setResizable(true);
}

function close() {
  mainWindow.close();
}

function resize() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  if (!mainWindow.isMaximized()) {
    mainWindow.maximize();
  } else {
    mainWindow.unmaximize();
    mainWindow.setSize(width - 100, height - 100, true);
    mainWindow.center();
  }
}

async function getSettings(key: string) {
  return await settings.get(key);
}

async function setSettings(key: string, value: string) {
  return await settings.set(key, value);
}

function toggleDevTools() {
  if (mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }
}

function setTitle(title: string) {
  mainWindow.setTitle(title);
}