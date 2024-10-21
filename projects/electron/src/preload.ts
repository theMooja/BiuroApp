import { contextBridge, ipcRenderer } from "electron";
import { IClientEntity, IMarchEntity, IMonthlyEntity, IStopperEntity, IUserEntity } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  saveUser: (data: IUserEntity) => ipcRenderer.invoke('db:User:saveUser', data),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
  setUser: (user: IUserEntity) => ipcRenderer.invoke('db:User:setUser', user),

  getClients: () => ipcRenderer.invoke('db:Client:getClients'),

  getMonthlies: (year: number, month: number) => ipcRenderer.invoke('db:Monthly:getMonthlies', year, month),
  updateNotes: (monthlyId: number, notes: string) => ipcRenderer.invoke('db:Monthly:updateNotes', monthlyId, notes),
  getLatestMonthly: (client: IClientEntity) => ipcRenderer.invoke('db:Monthly:getLatestMonthly', client),
  updateMarches: (monthlyId: number, marches: IMarchEntity[]) => ipcRenderer.invoke('db:Monthly:updateMarches', monthlyId, marches),
  recreateMonthlies: (year: number, month: number, monthlies: IMonthlyEntity[]) => ipcRenderer.invoke('db:Monthly:recreateMonthlies', year, month, monthlies),

  updateMarchValue: (march: IMarchEntity) => ipcRenderer.invoke('db:March:updateMarchValue', march),
  addStopper: (march: IMarchEntity, time: number, from: Date) => ipcRenderer.invoke('db:March:addStopper', march, time, from),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;