import { app, BrowserWindow, ipcMain } from "electron";
import path from 'path';
import mongoose from 'mongoose';
import dbApi from './api/db';
import testdata from './testdata';
import * as settings from 'electron-settings';
import "reflect-metadata";
import { AppDataSource } from './datasource';
import { UserController } from "./entity/User";


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}


let mainWindow: BrowserWindow | null;
settings.configure({
  fileName: 'app-settings.json',
  dir: process.resourcesPath
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


  mainWindow.maximize();
  mainWindow.webContents.openDevTools();
};

const setupDatabase = async () => {
  const cs = app.isPackaged ?
    settings.getSync('database.connectionString').toString()
    : 'mongodb://localhost:27017/biuro';//?replicaSet=rs0';

  await mongoose.connect(cs);


  await AppDataSource.initialize().then(() => {
    console.log('Connected to Postgres');
  });

  await testdata.populate();
}

const setIPCHandlers = () => {
  ipcMain.handle('app:minimize', () => minimize());
  ipcMain.handle('app:maximize', () => maximize());
  ipcMain.handle('app:close', () => close());


  ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
  // ipcMain.handle('db:User:getUser', (e, name, password) => dbApi.User.getUser(name, password));
  ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
  ipcMain.handle('db:User:setUser', (e, user) => UserController.loggedUser = user);

  ipcMain.handle('db:March:getTemplates', (e) => dbApi.March.getTemplates());
  ipcMain.handle('db:March:saveTemplate', (e, template) => dbApi.March.saveTemplate(template));
  ipcMain.handle('db:March:updateMarchValue', (e, marchValue) => dbApi.March.updateMarchValue(marchValue));
  ipcMain.handle('db:March:addStopper', (e, marchValue, seconds, from) => dbApi.March.addStopper(marchValue, seconds, from));

  ipcMain.handle('db:Client:getMonthlies', (e, year, month) => dbApi.Client.getMonthlies(year, month));
  ipcMain.handle('db:Client:recreateMonthlies', (e, year, month, monthlies) => dbApi.Client.recreateMonthlies(year, month, monthlies));
  ipcMain.handle('db:Client:updateMonthlyNotes', (e, monthlyId, notes) => dbApi.Client.updateMonthlyNotes(monthlyId, notes));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  await setupDatabase();
  createWindow();
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
  mainWindow.setAlwaysOnTop(true);
  mainWindow.setSize(400, 100, true);
  mainWindow.setResizable(false);
}

function maximize(): any {
  mainWindow.setAlwaysOnTop(false);
  mainWindow.maximize();
  mainWindow.setResizable(true);
}

function close() {
  mainWindow.close();
}