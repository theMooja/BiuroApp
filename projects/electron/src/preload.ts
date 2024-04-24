import { contextBridge, ipcRenderer } from "electron";

const contextBridgeApi = {
  testData: (name: string) => ipcRenderer.invoke('db:testData', name),
  createMarchTemplate: (value: any) => ipcRenderer.invoke('db:createMarchTemplate', value),

}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;