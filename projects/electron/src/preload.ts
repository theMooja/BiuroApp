import { contextBridge, ipcRenderer } from "electron";
import { IMarchTemplate, IStopper, IUser } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  addTime: (data: IStopper) => ipcRenderer.invoke('db:Stopper:addTime', data),

  saveUser: (data: IUser) => ipcRenderer.invoke('db:User:saveUser', data),
  getUser: (name: string, password: string) => ipcRenderer.invoke('db:User:getUser', name, password),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),

  getMarchTemplates: () => ipcRenderer.invoke('db:March:getTemplates'),
  saveMarchTemplate: (template: IMarchTemplate) => ipcRenderer.invoke('db:March:saveTemplate', template),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;