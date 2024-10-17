import { ipcMain } from "electron";
import { AppDataSource } from "./datasource";
import { MonthlyEntity } from "./entity/Monthly";
import { IMarchEntity, IMonthlyEntity, IUserEntity } from "./interfaces";
import { UserEntity } from "./entity/User";
import { MarchEntity } from "./entity/March";
import { StopperEntity } from "./entity/Stopper";


export const setIPCHandlers = () => {

  ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
  ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
  ipcMain.handle('db:User:setUser', (e, user) => UserController.setLoggedUser(user));

  // ipcMain.handle('db:March:getTemplates', (e) => dbApi.March.getTemplates());
  // ipcMain.handle('db:March:saveTemplate', (e, template) => dbApi.March.saveTemplate(template));
  ipcMain.handle('db:March:updateMarchValue', (e, march) => MarchController.updateMarchValue(march));

  ipcMain.handle('db:March:addStopper', (e, march, seconds, from) => MarchController.addStopper(march, seconds, from));
  ipcMain.handle('db:Client:getMonthlies', (e, year, month) => MonthlyController.getMonthlies(year, month));
  // ipcMain.handle('db:Client:recreateMonthlies', (e, year, month, monthlies) => dbApi.Client.recreateMonthlies(year, month, monthlies));
  ipcMain.handle('db:Client:updateNotes', (e, monthlyId, notes) => MonthlyController.updateNotes(monthlyId, notes));
}

export const MonthlyController = {
  async getMonthlies(year: number, month: number): Promise<IMonthlyEntity[]> {
    return await AppDataSource
      .getRepository(MonthlyEntity)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'client')
      .leftJoinAndSelect('m.marches', 'mar')
      .leftJoinAndSelect('mar.stoppers', 'stop')
      .where('m.month = :month AND m.year = :year', { month, year })
      .getMany();
  },

  async updateNotes(monthlyId: number, note: string) {
    let monthly = await AppDataSource
      .getRepository(MonthlyEntity)
      .findOneBy({ id: monthlyId });
    if (monthly) {
      monthly.note = note;
      await monthly.save();
    }
  }
}


export const UserController = {
  get loggedUser(): UserEntity {
    return this._loggedUser;
  },

  set loggedUser(user: UserEntity) {
    this._loggedUser = user;
  },

  async setLoggedUser(user: IUserEntity) {
    this.loggedUser = await UserEntity.findOneBy({ name: user.name });
  },

  async getUsers(): Promise<IUserEntity[]> {
    let users = await UserEntity.find();

    return users;
  },

  async saveUser(data: IUserEntity) {
    let user = await UserEntity.findOneBy({ name: data.name });
    if (!user) {
      user = new UserEntity();
    }
    user.name = data.name;
    user.password = data.password;
    await user.save();
  }
}

export const MarchController = {
  async updateMarchValue(march: IMarchEntity) {
    await AppDataSource
      .getRepository(MarchEntity)
      .update(march.id, {
        value: march.value
      });
  },

  async addStopper(march: IMarchEntity, time: number, from: Date) {
    console.log(march, time, from);
    let marchEntity = await MarchEntity.findOneBy({ id: march.id })

    let stopper = StopperEntity.create({ march: marchEntity, user: UserController.loggedUser, seconds: time, from: from });
    await stopper.save();
  }
}
