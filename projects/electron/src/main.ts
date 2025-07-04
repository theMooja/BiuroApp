import { app, BrowserWindow, dialog, ipcMain, screen, shell } from "electron";
import path from 'path';
import testdata from './testdata';
import * as settings from 'electron-settings';
import "reflect-metadata";
import { initializeDatabase } from './datasource';
import { setIPCHandlers } from "./handlers";
import { DataSource } from "typeorm";
import { Client } from "pg";
import * as fs from 'fs';
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import iconv from 'iconv-lite';

const { updateElectronApp } = require('update-electron-app');
if (app.isPackaged)
  updateElectronApp();

const userDataDir = app.getPath('userData');
const userSettingsPath = path.join(userDataDir, 'app-settings.json');
const defaultSettingsPath = path.join(__dirname, 'app-settings.json');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow | null;
const createWindow = (): BrowserWindow => {
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

  return mainWindow;
};

const setupDatabase = async (): Promise<DataSource> => {
  let config: any = {};

  if (app.isPackaged) {
    let dbsettings: any = settings.getSync('database')
    config.port = dbsettings.port;
    config.host = dbsettings.host;
    config.username = dbsettings.username;
    config.password = dbsettings.password;
    config.database = dbsettings.database;
    config.logging = false;
    config.synchronize = false;
  }

  let dsPromise = initializeDatabase(config);
  dsPromise.then(() => {
    console.log('Connected to Postgres');
  })
    .catch(err => console.error('Error:', err));

  let db = await dsPromise;


  if (!app.isPackaged)
    await testdata.populate();

  return db
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

  ipcMain.handle('app:pickFolder', async () => pickFolder());
  ipcMain.handle('app:openFolder', async (e, path) => openFolder(path));
  ipcMain.handle('app:pickFile', async () => pickFile());
  ipcMain.handle('app:openFile', async (e, path) => openFolder(path));

  ipcMain.handle('app:convertFromOEM852', (e, data: string) => convertFromOEM852(data));
}

const getRawClient = async (AppDataSource: DataSource) => {
  const options = AppDataSource.options as PostgresConnectionOptions;

  const rawClient = new Client({
    host: options.host,
    port: options.port,
    user: options.username,
    password: options.password,
    database: options.database,
  });

  await rawClient.connect();

  return rawClient;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  initializeAppSettings();
  let ds = await setupDatabase();
  let window = createWindow();
  let pgClient = await getRawClient(ds);
  setAppHandlers();
  await setIPCHandlers(window, pgClient);
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

async function pickFolder() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (canceled) return null;
  return filePaths[0];
}

async function openFolder(path: string) {
  return shell.openPath(path);
}

async function pickFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (canceled) return null;
  return filePaths[0];
}

function initializeAppSettings() {
  // Ensure userData directory exists
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  // Copy default settings if they don't exist in userData
  if (!fs.existsSync(userSettingsPath)) {
    if (fs.existsSync(defaultSettingsPath)) {
      fs.copyFileSync(defaultSettingsPath, userSettingsPath);
      console.log('Copied default app-settings.json to userData');
    } else {
      // Optionally: create a blank or fallback version
      fs.writeFileSync(userSettingsPath, JSON.stringify({}));
      console.warn('Default app-settings.json not found, created empty one');
    }
  }

  // Configure electron-settings to use the file in userData
  settings.configure({
    fileName: 'app-settings.json',
    dir: app.isPackaged ? userDataDir : __dirname
  });


  console.log('App settings initialized at:', userSettingsPath);
}

function convertFromOEM852(data: string): string {
  // Step 1: Convert JS string to Buffer using latin1 (1:1 byte mapping)
  const binaryBuffer = Buffer.from(data, 'binary');

  // Step 2: Decode the buffer from OEM852 to a proper UTF-8 string
  const utf8String = iconv.decode(binaryBuffer, 'cp852');

  return utf8String;
}