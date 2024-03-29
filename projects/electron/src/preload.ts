import { contextBridge, ipcRenderer } from "electron";

const contextBridgeApi = {
  testData: () => ipcRenderer.invoke('db:testData')
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;