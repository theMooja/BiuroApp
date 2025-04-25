import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IClientEntity, IInvoiceEntity, IMarchEntity, IMonthlyEntity, INoteEntity, IReport, IReportHeader, IStopperEntity, IUserEntity } from "./interfaces";

const contextBridgeApi = {
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),
  resize: () => ipcRenderer.invoke('app:resize'),
  getLastUserName: () => ipcRenderer.invoke('app:getLastUserName'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppSettings: (key: string) => ipcRenderer.invoke('app:getAppSettings', key),
  setAppSettings: (key: string, value: string) => ipcRenderer.invoke('app:setAppSettings', key, value),
  toggleDevTools: () => ipcRenderer.invoke('app:toggleDevTools'),
  setTitle: (title: string) => ipcRenderer.invoke('app:setTitle', title),

  getListValues: (target: string) => ipcRenderer.invoke('db:listValues', target),

  saveUser: (data: IUserEntity) => ipcRenderer.invoke('db:User:saveUser', data),
  getUsers: () => ipcRenderer.invoke('db:User:getUsers'),
  setUser: (user: IUserEntity) => ipcRenderer.invoke('db:User:setUser', user),

  getClients: () => ipcRenderer.invoke('db:Client:getClients'),
  saveClient: (client: IClientEntity) => ipcRenderer.invoke('db:Client:saveClient', client),
  syncFakturowniaIds: () => ipcRenderer.invoke('db:Client:syncFakturowniaIds'),

  getMonthlies: (year: number, month: number) => ipcRenderer.invoke('db:Monthly:getMonthlies', year, month),
  getMonthly: (id: number) => ipcRenderer.invoke('db:Monthly:getMonthly', id),
  updateNote: (note: INoteEntity) => ipcRenderer.invoke('db:Monthly:updateNote', note),
  deleteNote: (note: INoteEntity) => ipcRenderer.invoke('db:Monthly:deleteNote', note),
  getLatestMonthly: (client: IClientEntity) => ipcRenderer.invoke('db:Monthly:getLatestMonthly', client),
  updateMarches: (monthlyId: number, marches: IMarchEntity[]) => ipcRenderer.invoke('db:Monthly:updateMarches', monthlyId, marches),
  recreateMonthlies: (year: number, month: number, monthlies: IMonthlyEntity[]) => ipcRenderer.invoke('db:Monthly:recreateMonthlies', year, month, monthlies),
  updateInfo: (monthly: IMonthlyEntity) => ipcRenderer.invoke('db:Monthly:updateInfo', monthly),

  updateMarchValue: (march: IMarchEntity) => ipcRenderer.invoke('db:March:updateMarchValue', march),
  addStopper: (march: IMarchEntity, time: number, from: Date) => ipcRenderer.invoke('db:March:addStopper', march, time, from),

  saveInvoice: (invoice: IInvoiceEntity) => ipcRenderer.invoke('db:Invoice:saveInvoice', invoice),
  saveInvoiceDates: (invoices: IInvoiceEntity[]) => ipcRenderer.invoke('db:Invoice:saveInvoiceDates', invoices),
  getInvoices: (clientId: number, year: number, month: number) => ipcRenderer.invoke('db:Invoice:getInvoices', clientId, year, month),
  integrateInvoice: (invoice: IInvoiceEntity) => ipcRenderer.invoke('db:Invoice:integrateInvoice', invoice),

  generateReport: (header: IReportHeader, data: any) => ipcRenderer.invoke('db:Report:generate', header, data),
  getHeaders: () => ipcRenderer.invoke('db:Report:getHeaders'),
  getReport: (report: IReportHeader) => ipcRenderer.invoke('db:Report:getReport', report),
  removeReport: (report: IReportHeader) => ipcRenderer.invoke('db:Report:removeReport', report),
  saveReport: (report: IReport) => ipcRenderer.invoke('db:Report:saveReport', report),

  onMonthlyTrigger: (callback: (monthly: IMonthlyEntity, operation: string) => void) =>
    ipcRenderer.on('trigger:monthly', (event, monthly: IMonthlyEntity, operation: string) => callback(monthly, operation)),

}

contextBridge.exposeInMainWorld('electron', contextBridgeApi);

export type ContextBridgeApi = typeof contextBridgeApi;