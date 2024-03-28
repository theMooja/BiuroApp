import { contextBridge, ipcRenderer } from "electron";


//import dbApi from './api/db';
const dbApi = {
  testData(): string {
    return 'dbTestData';
  }
}

const contextBridgeApi = {
  ...dbApi
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;