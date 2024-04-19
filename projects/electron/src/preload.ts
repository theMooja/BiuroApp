import { contextBridge, ipcRenderer } from "electron";

const contextBridgeApi = {
  testData: (name: string) => ipcRenderer.invoke('db:testData', name),
  createMarch: (name: string, steps: [any]) => ipcRenderer.invoke('db:createMarch', name, steps),

}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;