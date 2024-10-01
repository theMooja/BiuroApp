import { contextBridge, ipcRenderer } from "electron";
import { ClientMonthly, IMarchTemplate, IStopper, IUser, MarchValue } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  addTime: (data: IStopper) => ipcRenderer.invoke('db:Stopper:addTime', data),

  saveUser: (data: IUser) => ipcRenderer.invoke('db:User:saveUser', data),
  getUser: (name: string, password: string) => ipcRenderer.invoke('db:User:getUser', name, password),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
  setUser: (user: IUser) => ipcRenderer.invoke('db:User:setUser', user),

  getMarchTemplates: () => ipcRenderer.invoke('db:March:getTemplates'),
  saveMarchTemplate: (template: IMarchTemplate) => ipcRenderer.invoke('db:March:saveTemplate', template),
  updateMarchValue: (marchValue: MarchValue) => ipcRenderer.invoke('db:March:updateMarchValue', marchValue),
  addStopper: (marchValue: MarchValue, seconds: number, from: Date) => ipcRenderer.invoke('db:March:addStopper', marchValue, seconds, from),

  getClientsMonthlies: (year: number, month: number) => ipcRenderer.invoke('db:Client:getMonthlies', year, month),
  recreateMonthlies: (year: number, month: number, monthlies: ClientMonthly[]) => ipcRenderer.invoke('db:Client:recreateMonthlies', year, month, monthlies),
  updateMonthly: (client: ClientMonthly) => ipcRenderer.invoke('db:Client:updateMonthly', client),

}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;