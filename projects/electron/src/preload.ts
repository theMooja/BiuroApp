import { contextBridge, ipcRenderer } from "electron";
import { IClientMonthly, IMarchTemplate } from "./interfaces";


const contextBridgeApi = {
  saveMarchTemplate: (value: IMarchTemplate) => ipcRenderer.invoke('db:March:saveTemplate', value),
  findMarchTemplates: (value?: string) => ipcRenderer.invoke('db:March:findTemplates', value),
  updateMarchValue: (data: IClientMonthly, idx: number, val: number) => ipcRenderer.invoke('db:Client:updateMarchValue', data, idx, val),
  getClientsMonthly: (year: number, month: number) => ipcRenderer.invoke('db:Client:getClientsMonthly', year, month),
  updateClient: (client: string, data: any) => ipcRenderer.invoke('db:Client:updateClient', client, data),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;