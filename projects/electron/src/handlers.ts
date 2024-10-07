import { ipcMain } from "electron";
import { UserController } from "./entity/User";


export const setIPCHandlers = () => {
    
    ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
    ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
    ipcMain.handle('db:User:setUser', (e, user) => UserController.loggedUser = user);
  
    // ipcMain.handle('db:March:getTemplates', (e) => dbApi.March.getTemplates());
    // ipcMain.handle('db:March:saveTemplate', (e, template) => dbApi.March.saveTemplate(template));
    // ipcMain.handle('db:March:updateMarchValue', (e, marchValue) => dbApi.March.updateMarchValue(marchValue));
    // ipcMain.handle('db:March:addStopper', (e, marchValue, seconds, from) => dbApi.March.addStopper(marchValue, seconds, from));
  
    // ipcMain.handle('db:Client:getMonthlies', (e, year, month) => dbApi.Client.getMonthlies(year, month));
    // ipcMain.handle('db:Client:recreateMonthlies', (e, year, month, monthlies) => dbApi.Client.recreateMonthlies(year, month, monthlies));
    // ipcMain.handle('db:Client:updateMonthlyNotes', (e, monthlyId, notes) => dbApi.Client.updateMonthlyNotes(monthlyId, notes));
  }