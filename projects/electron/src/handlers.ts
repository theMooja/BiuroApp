import { BrowserWindow, ipcMain } from "electron";
import { Client } from "pg";
import { IMonthlyEntity } from "./interfaces";
import { UserController } from "./controller/UserController";
import { ClientController } from "./controller/ClientController";
import { MonthlyController } from "./controller/MonthlyController";
import { InvoiceController } from "./controller/InvoiceController";
import { ListValuesController } from "./controller/ListValuesController";
import { MarchController } from "./controller/MarchController";
import { ReportController } from "./controller/ReportController";


export const setIPCHandlers = async (window: BrowserWindow, rawClient: Client) => {
  ipcMain.handle('db:listValues', (e, target) => ListValuesController.get(target));

  ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
  ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
  ipcMain.handle('db:User:setUser', (e, user) => UserController.setLoggedUser(user));

  ipcMain.handle('db:Client:getClients', (e) => ClientController.getClients());
  ipcMain.handle('db:Client:saveClient', (e, client) => ClientController.saveClient(client));
  ipcMain.handle('db:Client:syncFakturowniaIds', (e) => ClientController.syncFakturowniaIds());

  ipcMain.handle('db:March:updateMarchValue', (e, march) => MarchController.updateMarchValue(march));
  ipcMain.handle('db:March:addStopper', (e, march, seconds, from) => MarchController.addStopper(march, seconds, from));
  ipcMain.handle('db:March:updateStopper', (e, stopper) => MarchController.updateStopper(stopper));

  ipcMain.handle('db:Monthly:getMonthlies', (e, year, month) => MonthlyController.getMonthlies(year, month));
  ipcMain.handle('db:Monthly:getMonthly', (e, id) => MonthlyController.getMonthly(id));
  ipcMain.handle('db:Monthly:updateNote', (e, note) => MonthlyController.updateNote(note));
  ipcMain.handle('db:Monthly:deleteNote', (e, note) => MonthlyController.deleteNote(note));
  ipcMain.handle('db:Monthly:getLatestMonthly', (e, client) => MonthlyController.getLatestMonthly(client));
  ipcMain.handle('db:Monthly:updateMarches', (e, monthlyId, marches) => MonthlyController.updateMarches(monthlyId, marches));
  ipcMain.handle('db:Monthly:recreateMonthlies', (e, year, month, monthlies) => MonthlyController.recreateMonthlies(year, month, monthlies));
  ipcMain.handle('db:Monthly:updateInfo', (e, data) => MonthlyController.updateInfo(data));

  ipcMain.handle('db:Invoice:saveInvoice', (e, data) => InvoiceController.saveInvoice(data));
  ipcMain.handle('db:Invoice:saveInvoiceDates', (e, invoices) => InvoiceController.saveInvoiceDates(invoices));
  ipcMain.handle('db:Invoice:getInvoices', (e, clientId, year, month) => InvoiceController.getInvoices(clientId, year, month));
  ipcMain.handle('db:Invoice:integrateInvoice', (e, invoice) => InvoiceController.integrateInvoice(invoice));

  ipcMain.handle('db:Report:generate', (e, header, data) => ReportController.generateReport(header, data));
  ipcMain.handle('db:Report:getReport', (e, header) => ReportController.getReport(header));
  ipcMain.handle('db:Report:getHeaders', (e) => ReportController.getHeaders());
  ipcMain.handle('db:Report:removeReport', (e, report) => ReportController.removeReport(report));
  ipcMain.handle('db:Report:saveReport', (e, report) => ReportController.saveReport(report));

  // Listen for notifications
  rawClient.on('notification', async (msg) => {
    console.log('📣 Notification received:', msg.channel, msg.payload);

    if (msg.channel === 'monthly_update_channel') {
      const payload = JSON.parse(msg.payload) as { monthlyId: number, operation: string };
      let monthly = await MonthlyController.getMonthly(payload.monthlyId);
      if (!monthly) monthly = { id: payload.monthlyId } as IMonthlyEntity;
      //console.log('📣 Monthly update:', monthly, payload.operation);
      window.webContents.send('trigger:monthly', monthly, payload.operation);
    }
  });

  await rawClient.query('LISTEN monthly_update_channel');
}