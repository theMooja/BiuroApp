import { contextBridge, ipcRenderer } from "electron";

const contextBridgeApi = {
  testData: (name: string) => ipcRenderer.invoke('db:testData', name)
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;