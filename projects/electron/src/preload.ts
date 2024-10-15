import { contextBridge, ipcRenderer } from "electron";
import { IStopperEntity, IUserEntity } from "./interfaces";


const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  addTime: (data: IStopperEntity) => ipcRenderer.invoke('db:Stopper:addTime', data),

  saveUser: (data: IUserEntity) => ipcRenderer.invoke('db:User:saveUser', data),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
  setUser: (user: IUserEntity) => ipcRenderer.invoke('db:User:setUser', user),

  getMonthlies: (year: number, month: number) => ipcRenderer.invoke('db:Client:getMonthlies', year, month),
  updateNotes: (monthlyId: number, notes: string) => ipcRenderer.invoke('db:Client:updateNotes', monthlyId, notes),
}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;