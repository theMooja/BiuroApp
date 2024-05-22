import { contextBridge, ipcRenderer } from "electron";
import { IMarchTemplate } from "./interfaces";


const contextBridgeApi = {
  testData: (name: string) => ipcRenderer.invoke('db:testData', name),
  saveMarchTemplate: (value: IMarchTemplate) => ipcRenderer.invoke('db:March:saveTemplate', value),
  findMarchTemplates: (value?: string) => ipcRenderer.invoke('db:March:findTemplates', value),
  getClientsMonthly: (year: number, month: number) => ipcRenderer.invoke('db:Client:getClientsMonthly', year, month),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;