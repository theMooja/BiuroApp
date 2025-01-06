import { app, BrowserWindow, ipcMain } from "electron";
import path from 'path';
import testdata from './testdata';
import * as settings from 'electron-settings';
import "reflect-metadata";
import { AppDataSource } from './datasource';
import { setIPCHandlers } from "./handlers";
import { autoUpdater } from 'electron-updater';
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
});

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded; the app will now install.');
  //autoUpdater.quitAndInstall(); // Apply the update immediately
});


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}


let mainWindow: BrowserWindow | null;
settings.configure({
  fileName: 'app-settings.json',
  dir: __dirname
});


const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
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

  autoUpdater.checkForUpdatesAndNotify();
  maximize();
  mainWindow.webContents.openDevTools();
};

const setupDatabase = async () => {
  await AppDataSource.initialize().then(() => {
    console.log('Connected to Postgres');
  });

  await testdata.populate();
}

const setAppHandlers = () => {
  ipcMain.handle('app:minimize', () => minimize());
  ipcMain.handle('app:maximize', () => maximize());
  ipcMain.handle('app:close', () => close());

  ipcMain.handle('app:getLastUserName', () => settings.getSync('lastUserName'));
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