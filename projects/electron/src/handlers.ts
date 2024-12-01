import { ipcMain } from "electron";
import { AppDataSource } from "./datasource";
import { MonthlyEntity } from "./entity/Monthly";
import { IClientEntity, IInvoiceEntity, IListValue, IMarchEntity, IMonthlyEntity, INoteEntity, IReport, IReportHeader, IStopperEntity, IUserEntity } from "./interfaces";
import { UserEntity } from "./entity/User";
import { MarchEntity } from "./entity/March";
import { StopperEntity } from "./entity/Stopper";
import { ClientEntity } from "./entity/Client";
import { In } from "typeorm";
import { InvoiceEntity } from "./entity/Invoice";
import { ListValueEntity } from "./entity/ListValue";
import * as settings from 'electron-settings';
import { NoteEntity } from "./entity/Note";
import { ReportEntity } from "./entity/Report";

export const setIPCHandlers = () => {
  ipcMain.handle('db:listValues', (e, target) => ListValuesController.get(target));

  ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
  ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
  ipcMain.handle('db:User:setUser', (e, user) => UserController.setLoggedUser(user));

  ipcMain.handle('db:Client:getClients', (e) => ClientController.getClients());

  ipcMain.handle('db:March:updateMarchValue', (e, march) => MarchController.updateMarchValue(march));
  ipcMain.handle('db:March:addStopper', (e, march, seconds, from) => MarchController.addStopper(march, seconds, from));

  ipcMain.handle('db:Monthly:getMonthlies', (e, year, month) => MonthlyController.getMonthlies(year, month));
  ipcMain.handle('db:Monthly:getMonthly', (e, id) => MonthlyController.getMonthly(id));
  ipcMain.handle('db:Monthly:updateNote', (e, note) => MonthlyController.updateNote(note));
  ipcMain.handle('db:Monthly:getLatestMonthly', (e, client) => MonthlyController.getLatestMonthly(client));
  ipcMain.handle('db:Monthly:updateMarches', (e, monthlyId, marches) => MonthlyController.updateMarches(monthlyId, marches));
  ipcMain.handle('db:Monthly:recreateMonthlies', (e, year, month, monthlies) => MonthlyController.recreateMonthlies(year, month, monthlies));
  ipcMain.handle('db:Monthly:updateInfo', (e, data) => MonthlyController.updateInfo(data));

  ipcMain.handle('db:Invoice:saveInvoice', (e, data) => InvoiceController.saveInvoice(data));

  ipcMain.handle('db:Report:generate', (e, name, data) => ReportController.generateReport(name, data));
  ipcMain.handle('db:Report:getReport', (e, header) => ReportController.getReport(header));
  ipcMain.handle('db:Report:getHeaders', (e) => ReportController.getHeaders());
}

export const MonthlyController = {
  async getMonthlies(year: number, month: number): Promise<IMonthlyEntity[]> {
    return await AppDataSource
      .getRepository(MonthlyEntity)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'client')
      .leftJoinAndSelect('m.invoices', 'inv')
      .leftJoinAndSelect('inv.lines', 'lin')
      .leftJoinAndSelect('m.marches', 'mar')
      .leftJoinAndSelect('mar.stoppers', 'stop')
      .leftJoinAndSelect('m.notes', 'not')
      .where('m.month = :month AND m.year = :year', { month, year })
      .getMany();
  },

  async getMonthly(id: number): Promise<IMonthlyEntity> {
    return await AppDataSource
      .getRepository(MonthlyEntity)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'client')
      .leftJoinAndSelect('m.invoices', 'inv')
      .leftJoinAndSelect('inv.lines', 'lin')
      .leftJoinAndSelect('m.marches', 'mar')
      .leftJoinAndSelect('mar.stoppers', 'stop')
      .leftJoinAndSelect('m.notes', 'not')
      .where('m.id = :id', { id })
      .getOne();
  },

  async updateInfo(data: IMonthlyEntity) {
    let repo = AppDataSource.getRepository(MonthlyEntity);
    let monthly = await repo.findOneBy({ id: data.id });
    if (monthly) {
      monthly.info = data.info;
      await monthly.save();
    }
  },

  async updateNote(note: INoteEntity) {
    await NoteEntity.save({
      id: note.id,
      monthly: note.monthly,
      text: note.text,
      persists: note.persists,
      user: note.user
    });
  },

  async getLatestMonthly(client: IClientEntity): Promise<IMonthlyEntity> {
    return await AppDataSource
      .getRepository(MonthlyEntity)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'client')
      .leftJoinAndSelect('m.marches', 'mar')
      .where('m.client = :clientId', { clientId: client.id })
      .orderBy('m.year', 'DESC')
      .addOrderBy('m.month', 'DESC')
      .getOne();
  },

  async updateMarches(monthlyId: number, marches: IMarchEntity[]) {
    await AppDataSource
      .getRepository(MarchEntity)
      .createQueryBuilder()
      .delete()
      .from(MarchEntity, 'm')
      .where('monthlyId = :monthlyId', { monthlyId })
      .execute();

    let monthly = await MonthlyEntity.findOne({
      where: { id: monthlyId },
      relations: ['marches']
    })

    monthly.marches = marches.map(march => MarchEntity.create({
      name: march.name,
      sequence: march.sequence,
      weight: march.weight,
      type: march.type
    }));
    monthly.save();
  },

  async recreateMonthlies(year: number, month: number, monthlies: IMonthlyEntity[]) {
    let clients = [];

    if (monthlies.length > 0) {
      clients = monthlies.map(m => m.client);
    } else {
      clients = await ClientController.getClients();
    }

    await MonthlyEntity.remove(
      await MonthlyEntity.find(
        { where: { year, month, client: In(clients.map(c => c.id)) } }));

    for (let client of clients) {

      let latest = await AppDataSource
        .getRepository(MonthlyEntity)
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.client', 'client')
        .leftJoinAndSelect('m.marches', 'mar')
        .where('m.year < :year OR (m.year = :year AND m.month < :month)', { year: year, month: month })
        .andWhere('client.id = :clientId', { clientId: client.id })
        .orderBy('m.year', 'DESC')
        .addOrderBy('m.month', 'DESC')
        .getOne();

      if (!latest) continue;

      let monthly = new MonthlyEntity();
      monthly.year = year;
      monthly.month = month;
      monthly.client = latest.client;
      monthly.info = latest?.info;
      monthly.marches = latest.marches.map(m => MarchEntity.create({
        name: m.name,
        sequence: m.sequence,
        weight: m.weight,
        type: m.type
      }));
      monthly.notes = latest.notes.filter(n => n.persists);
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
    settings.set('lastUserName', user.name);
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

  async addStopper(march: IMarchEntity, time: number, from: Date): Promise<IStopperEntity> {
    let marchEntity = await MarchEntity.findOneBy({ id: march.id })

    let stopper = StopperEntity.create({
      march: marchEntity,
      user: UserController.loggedUser,
      seconds: time,
      from: from
    });
    return await stopper.save();
  }
}

export const ClientController = {
  async getClients(): Promise<IClientEntity[]> {
    return await AppDataSource
      .getRepository(ClientEntity)
      .find({
        where: {
          isActive: true
        }
      });
  }
}

export const InvoiceController = {
  async saveInvoice(data: IInvoiceEntity) {
    let repo = AppDataSource.getRepository(InvoiceEntity);
    const invoice = Object.assign(new InvoiceEntity(), data);
    await repo.save(invoice);
  }
}

export const ListValuesController = {
  async get(target: string): Promise<IListValue[]> {
    let repo = AppDataSource.getRepository(ListValueEntity);

    return await repo.find({
      where: {
        target: target
      }
    });
  }
}

export const ReportController = {
  async generateReport(name: string, data: any): Promise<IReportHeader> {

    let repo = AppDataSource.getRepository(ReportEntity);
    let report = new ReportEntity();
    report.name = name;
    report.type = data.type;
    report.input = JSON.stringify(data);
    report.output = '';

    return await repo.save(report);
  },

  async getReport(report: IReportHeader): Promise<IReport> {
    let repo = AppDataSource.getRepository(ReportEntity);
    let reportEntity = await repo.findOneBy({ id: report.id });
    return reportEntity;
  },

  async getHeaders(): Promise<IReportHeader[]> {
    let repo = AppDataSource.getRepository(ReportEntity);
    return await repo.find();
  }
}
