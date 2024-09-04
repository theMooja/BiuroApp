import { contextBridge, ipcRenderer } from "electron";
import { IClientMonthly, IMarchTemplate, IStopper, IUser } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),
  saveMarchTemplate: (value: IMarchTemplate) => ipcRenderer.invoke('db:March:saveTemplate', value),
  findMarchTemplates: (value?: string) => ipcRenderer.invoke('db:March:findTemplates', value),
  updateMarchValue: (data: IClientMonthly, idx: number, val: number) => ipcRenderer.invoke('db:Client:updateMarchValue', data, idx, val),
  getClientsMonthly: (year: number, month: number) => ipcRenderer.invoke('db:Client:getClientsMonthly', year, month),
  updateClient: (client: string, data: any) => ipcRenderer.invoke('db:Client:updateClient', client, data),
  addTime: (data: IStopper) => ipcRenderer.invoke('db:Stopper:addTime', data),
  saveUser: (data: IUser) => ipcRenderer.invoke('db:User:saveUser', data),
  getUser: (name: string, password: string) => ipcRenderer.invoke('db:User:getUser', name, password),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;