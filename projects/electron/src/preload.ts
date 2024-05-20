import { contextBridge, ipcRenderer } from "electron";
import { IMarchTemplate } from "./interfaces";


const contextBridgeApi = {
  testData: (name: string) => ipcRenderer.invoke('db:testData', name),
  createMarchTemplate: (value: IMarchTemplate) => ipcRenderer.invoke('db:March:createTemplate', value),
  findMarchTemplates: (value?: string) => ipcRenderer.invoke('db:March:findTemplates', value),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;