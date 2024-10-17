import { contextBridge, ipcRenderer } from "electron";
import { IMarchEntity, IStopperEntity, IUserEntity } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  saveUser: (data: IUserEntity) => ipcRenderer.invoke('db:User:saveUser', data),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
  setUser: (user: IUserEntity) => ipcRenderer.invoke('db:User:setUser', user),

  getMonthlies: (year: number, month: number) => ipcRenderer.invoke('db:Client:getMonthlies', year, month),
  updateNotes: (monthlyId: number, notes: string) => ipcRenderer.invoke('db:Client:updateNotes', monthlyId, notes),

  updateMarchValue: (march: IMarchEntity) => ipcRenderer.invoke('db:March:updateMarchValue', march),
  addStopper: (march: IMarchEntity, time: number, from: Date) => ipcRenderer.invoke('db:March:addStopper', march, time, from),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;