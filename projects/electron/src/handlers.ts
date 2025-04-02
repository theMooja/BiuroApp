import { ipcMain } from "electron";
import { AppDataSource } from "./datasource";
import { MonthlyEntity } from "./entity/Monthly";
import { IBudgetReportInput, IBudgetReportOutput, IClientEntity, IEmployeesReportOutput, IInvoiceEntity, IInvoiceLineEntity, IListValue, IMarchEntity, IMonthlyEntity, INoteEntity, IProfitabilityReportInput, IProfitabilityReportOutput, IReport, IReportHeader, IStopperEntity, ISummaryReportOutput, IUserEntity, StepType } from "./interfaces";
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
import { InvoiceLineEntity } from "./entity/InvoiceLine";
import axios from "axios";

export const setIPCHandlers = () => {
  ipcMain.handle('db:listValues', (e, target) => ListValuesController.get(target));

  ipcMain.handle('db:User:saveUser', (e, data) => UserController.saveUser(data));
  ipcMain.handle('db:User:getUsers', (e) => UserController.getUsers());
  ipcMain.handle('db:User:setUser', (e, user) => UserController.setLoggedUser(user));

  ipcMain.handle('db:Client:getClients', (e) => ClientController.getClients());
  ipcMain.handle('db:Client:saveClient', (e, client) => ClientController.saveClient(client));

  ipcMain.handle('db:March:updateMarchValue', (e, march) => MarchController.updateMarchValue(march));
  ipcMain.handle('db:March:addStopper', (e, march, seconds, from) => MarchController.addStopper(march, seconds, from));

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
      .leftJoinAndSelect('mar.owner', 'o')
      .leftJoinAndSelect('m.notes', 'not')
      .leftJoinAndSelect('not.user', 'user')
      .where('m.month = :month AND m.year = :year', { month, year })
      .orderBy('mar.sequence', 'ASC')
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
      .leftJoinAndSelect('not.user', 'user')
      .where('m.id = :id', { id })
      .getOne();
  },

  async updateInfo(data: IMonthlyEntity) {
    let repo = AppDataSource.getRepository(MonthlyEntity);
    let monthly = await repo.findOneBy({ id: data.id });
    if (monthly && data.id) {
      monthly.info = data.info;
      await monthly.save();
    }
  },

  async updateNote(note: INoteEntity) {
    let updated = await NoteEntity.save({
      id: note.id,
      monthly: note.monthly,
      text: note.text,
      persists: note.persists,
      user: note.user === undefined ? null : note.user
    });

    return updated as INoteEntity;
  },

  async deleteNote(note: INoteEntity) {
    if (note.id)
      await NoteEntity.getRepository().delete({ id: note.id });
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
    const marchRepository = AppDataSource.getRepository(MarchEntity);

    let monthly = await MonthlyEntity.findOne({
      where: { id: monthlyId },
      relations: ['marches', 'marches.stoppers']
    });
    if (!monthly) {
      throw new Error("Monthly entity not found");
    }

    const existingMarches = monthly.marches;

    // Map existing marches for easy lookup
    const existingMarchesMap = new Map(existingMarches.map(march => [march.id, march]));
    const updatedMarches: MarchEntity[] = [];

    for (const march of marches) {
      if (march.id && existingMarchesMap.has(march.id)) {
        // Update existing march
        const existingMarch = existingMarchesMap.get(march.id);
        existingMarch.sequence = march.sequence;
        existingMarch.weight = march.weight;
        existingMarch.type = march.type;
        existingMarch.name = march.name;
        if (march.ownerId && march.ownerId !== existingMarch.owner?.id) {
          existingMarch.owner = await UserEntity.findOneBy({ id: march.ownerId });
        }

        updatedMarches.push(existingMarch);
      } else {
        // Create new march
        updatedMarches.push(marchRepository.create({
          name: march.name,
          sequence: march.sequence,
          weight: march.weight,
          type: march.type,
          owner: await UserEntity.findOneBy({ id: march.ownerId }),
          monthly: monthly
        }));
      }
    }

    // Save updated and new marches
    await marchRepository.save(updatedMarches);

    // Determine marches to delete (existing but not in the updated list)
    const marchesToDelete = existingMarches.filter(march => !marches.some(m => m.id === march.id));

    if (marchesToDelete.length > 0) {
      await marchRepository.remove(marchesToDelete);
    }
  },

  async recreateMonthlies(year: number, month: number, monthlies: IMonthlyEntity[]) {
    let clients = [];

    //get clients to create monthlies
    if (monthlies.length > 0) {
      clients = monthlies.map(m => m.client);
    } else {
      clients = await ClientController.getClients();
    }

    //remove current monthlies
    await MonthlyEntity.remove(
      await MonthlyEntity.find(
        { where: { year, month, client: In(clients.map(c => c.id)) } }));

    //copy monthlies
    for (let client of clients) {
      let latest = await AppDataSource
        .getRepository(MonthlyEntity)
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.client', 'client')
        .leftJoinAndSelect('m.marches', 'mar')
        .leftJoinAndSelect('mar.owner', 'o')
        .leftJoinAndSelect('m.notes', 'n')
        .leftJoinAndSelect('n.user', 'user')
        .where('(m.year < :year OR (m.year = :year AND m.month < :month))', { year: year, month: month })
        .andWhere('client.id = :clientId', { clientId: client.id })
        .orderBy('m.year', 'DESC')
        .addOrderBy('m.month', 'DESC')
        .getOne();

      let monthly = new MonthlyEntity();
      if (!latest) {
        monthly.year = year;
        monthly.month = month;
        monthly.client = await ClientEntity.findOneBy({ id: client.id });
        monthly.info = {
          email: '',
          podmiot: '',
          program: '',
          forma: '',
          wlasciciel: '',
          place: '',
          firma: ''
        };
        monthly.marches = [MarchEntity.create({
          name: '1',
          sequence: 1,
          weight: 0,
        })];
      }
      else {
        monthly.year = year;
        monthly.month = month;
        monthly.client = latest.client;
        monthly.info = latest?.info;
        monthly.marches = latest.marches.map(m => MarchEntity.create({
          name: m.name,
          sequence: m.sequence,
          weight: m.weight,
          type: m.type,
          owner: m.owner,
        }));
        monthly.notes = latest.notes?.filter(n => n.persists).map(n => ({ ...n, id: undefined } as NoteEntity));
      }

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
    user.permission = data.permission;

    await user.save();
  }
}

export const MarchController = {
  async updateMarchValue(march: IMarchEntity) {
    const update: Partial<MarchEntity> = {
      value: march.value
    };

    if (march.type === StepType.GYR && march.value === 1) {
      update.finishedAt = new Date();
    }
    if (march.type === StepType.GR && march.value === 1) {
      update.finishedAt = new Date();
    }
    if (march.type === StepType.DATE && march.value === 1) {
      update.finishedAt = march.finishedAt;
    }

    await AppDataSource
      .getRepository(MarchEntity)
      .update(march.id, update);
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
  },

  async saveClient(client: IClientEntity): Promise<IClientEntity> {
    let repo = AppDataSource.getRepository(ClientEntity);
    return await repo.save(client);
    // if(client.id) {
    //   let saved = await repo.update(client.id, client);
    //   return saved;
    // } else {

    // }
  }
}

export const InvoiceController = {
  async saveInvoice(data: IInvoiceEntity): Promise<IInvoiceEntity> {
    let invoiceRepo = AppDataSource.getRepository(InvoiceEntity);
    const lineRepo = AppDataSource.getRepository(InvoiceLineEntity);
    const monthlyRepo = AppDataSource.getRepository(MonthlyEntity);

    let invoice: InvoiceEntity;

    if (data.id) {
      invoice = await invoiceRepo.findOne({
        where: { id: data.id },
        relations: ['lines'],
      });

      invoice.sendDate = data.sendDate;
      invoice.paidDate = data.paidDate;
      invoice.no = data.no;
    }

    if (!invoice) {
      invoice = new InvoiceEntity();
      invoice.no = data.no;
      invoice.monthly = await monthlyRepo.findOneBy({ id: data.monthly.id });
      invoice.paidDate = data.paidDate;
      invoice.sendDate = data.sendDate;
    }

    //remove
    const inputLineIds = data.lines.map((line) => line.id);
    const linesToRemove = invoice.lines?.filter(
      (line) => !inputLineIds.includes(line.id)
    );

    if (linesToRemove?.length) {
      await lineRepo.remove(linesToRemove);
    }

    //add and update
    const updatedLines = data.lines.map((line) => {

      if (line.id) {
        const existingLine = invoice.lines.find((l) => l.id === line.id);
        if (existingLine) {
          existingLine.description = line.description;
          existingLine.price = line.price;
          existingLine.qtty = line.qtty;
          existingLine.category = line.category;
          existingLine.vat = line.vat;
          return existingLine;
        }
      }

      const newLine = new InvoiceLineEntity();
      newLine.description = line.description;
      newLine.price = line.price;
      newLine.qtty = line.qtty;
      newLine.category = line.category;
      newLine.vat = line.vat;
      return newLine;
    });

    invoice.lines = updatedLines;
    return (await invoiceRepo.save(invoice)) as unknown as IInvoiceEntity;
  },

  saveInvoiceDates(invoices: IInvoiceEntity[]) {
    const repo = AppDataSource.getRepository(InvoiceEntity);

    invoices.forEach(async (invoice) => {
      const entity = await repo.findOneBy({ id: invoice?.id });
      if (!entity) return;

      entity.sendDate = invoice.sendDate;
      entity.paidDate = invoice.paidDate;
      await entity.save();
    });
  },

  async getInvoices(clientId: number, year: number, month: number): Promise<IInvoiceEntity[]> {
    return await AppDataSource.getRepository(InvoiceEntity)
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .where('m.client = :clientId', { clientId })
      .andWhere('m.year = :year', { year })
      .andWhere('m.month = :month', { month })
      .getMany();
  },

  async integrateInvoice(invoice: IInvoiceEntity): Promise<IInvoiceEntity> {
    let repo = AppDataSource.getRepository(InvoiceEntity);
    let invoiceEntity = await repo.createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .leftJoinAndSelect('m.client', 'c')
      .where('i.id = :id', { id: invoice.id })
      .getOne();

    if (invoiceEntity.monthly.info.firma.toLowerCase() == 'finka') {
      let apiKey = await AppDataSource.getRepository(ListValueEntity).findOneBy({
        target: 'finka-fakturownia'
      });

      const fakturowniaDomain = 'finka';
      const apiToken = apiKey.value;

      const responseData = await this.sendInvoiceToFakturownia(invoiceEntity, fakturowniaDomain, apiToken);
      invoice.no = responseData.number;
      return await this.saveInvoice(invoice);
    }
  },

  async sendInvoiceToFakturownia(invoiceEntity: InvoiceEntity, fakturowniaDomain: string, apiToken: string) {

    const invoiceData = {
      api_token: apiToken,
      invoice: {
        kind: "vat",
        number: null as string | null,
        sell_date: invoiceEntity.sendDate,
        issue_date: invoiceEntity.sendDate,
        //payment_to: "2025-05-01",
        buyer_name: "Klient1 Sp. z o.o.",
        //buyer_email: invoiceEntity.monthly.info.email,
        buyer_tax_no: "6272616681",
        exempt_tax_kind: "",
        positions: invoiceEntity.lines.map(e => {
          return {
            name: e.description,
            tax: 'np',
            total_price_gross: e.price * e.qtty,
            quantity: e.qtty
          } as any;
        })
      }
    };

    try {
      const response = await axios.post(
        `https://${fakturowniaDomain}.fakturownia.pl/invoices.json`,
        invoiceData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data; // Handle the response as needed
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error; // Re-throw the error for further handling
    }
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
  async generateReport(header: IReportHeader, data: any): Promise<IReport> {
    let report: IReport = {
      id: header.id,
      name: header.name,
      type: header.type,
      input: JSON.stringify(data),
      output: JSON.stringify(await this.generateReportOutput(header.type, data))
    };

    return await this.saveReport(report);
  },

  async getReport(report: IReportHeader): Promise<IReport> {
    let repo = AppDataSource.getRepository(ReportEntity);
    let reportEntity = await repo.findOneBy({ id: report.id });
    return reportEntity;
  },

  async getHeaders(): Promise<IReportHeader[]> {
    let repo = AppDataSource.getRepository(ReportEntity);
    return await repo.find();
  },

  async saveReport(report: IReport): Promise<IReport> {
    let repo = AppDataSource.getRepository(ReportEntity);
    let entity: IReport;

    if (!report.id) {
      entity = new ReportEntity();
    } else {
      entity = await repo.findOneBy({ id: report.id });
    }
    entity.name = report.name;
    entity.type = report.type;
    entity.input = report.input;
    entity.output = report.output;

    return await repo.save(entity);
  },

  async removeReport(report: IReportHeader) {
    let repo = AppDataSource.getRepository(ReportEntity);
    let entity = await repo.findOneBy({ id: report.id });
    if (entity && report.id) {
      await repo.remove(entity);
    }
  },

  async generateReportOutput(reportType: string, input: any): Promise<string> {
    switch (reportType) {
      case 'summary':
        return await this.generateSummaryReportOutput(input);
      case 'budget':
        return await this.generateBudgetReportOutput(input);
      case 'clientProfitability':
        return await this.generateClientProfitabilityReportOutput(input);
      default:
        return '';
    }

  },

  async generateClientProfitabilityReportOutput(input: IProfitabilityReportInput): Promise<IProfitabilityReportOutput> {
    let output: IProfitabilityReportOutput = {
      employees: [],
      clients: []
    };

    let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .leftJoinAndSelect('m.client', 'c')
      .where('m.month = :month', { month: input.month })
      .andWhere('m.year = :year', { year: input.year })
      .getMany();

    let costShare = input.costSharePercent === 0 ? 1 : input.costSharePercent / 100;

    output.employees = input.employees.map(x => {
      return {
        userName: x.user.name,
        userId: x.user.id,
        cost: x.cost,
        seconds: 0,
        rate: 0,
      };
    });

    let stoppers = await AppDataSource.getRepository(StopperEntity).createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.march', 'm')
      .leftJoinAndSelect('m.monthly', 'o')
      .leftJoinAndSelect('o.client', 'c')
      .where('o.year = :year', { year: input.year })
      .andWhere('o.month = :month', { month: input.month })
      .getMany();

    stoppers.forEach(stopper => {
      let employee = output.employees.find(x => x.userId === stopper.user.id);
      if (employee) {
        employee.seconds += stopper.seconds;
      }
    });

    output.employees.forEach(employee => {
      employee.rate = employee.cost / employee.seconds;
    });

    let monthlies = await AppDataSource.getRepository(MonthlyEntity).createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'c')
      .where('m.year = :year', { year: input.year })
      .andWhere('m.month = :month', { month: input.month })
      .getMany();

    output.clients = monthlies.map(x => {
      return {
        client: x.client.name,
        cost: 0,
        seconds: 0,
        invoice: 0,
        share: 0,
        records: []
      };
    });

    invoices.forEach(invoice => {
      let sum = invoice.lines.reduce((sum, line) => {
        return sum + (line.qtty * line.price);
      }, 0);

      let oline = output.clients.find(x => x.client === invoice.monthly.client.name);
      if (oline) {
        oline.invoice += sum;
      }
    });

    stoppers.forEach(stopper => {
      let client = output.clients.find(x => x.client === stopper.march.monthly.client.name);
      let user = output.employees.find(x => x.userId === stopper.user.id);

      if (client && user) {
        client.cost += stopper.seconds * user.rate;
        client.seconds += stopper.seconds;

        client.records.push({
          user: stopper.user.name,
          march: stopper.march.name,
          cost: stopper.seconds * user.rate,
          seconds: stopper.seconds
        });
      }
    });

    output.clients.forEach(client => {
      client.share = (client.cost / (client.invoice * (1 - costShare))) * 100;
    });

    return output;
  },

  async generateSummaryReportOutput(input: any): Promise<ISummaryReportOutput> {
    let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .leftJoinAndSelect('m.client', 'c')
      .where('m.month = :month', { month: input.month })
      .andWhere('m.year = :year', { year: input.year })
      .getMany();

    let output = invoices.reduce((acc, inv) => {
      let forma = inv.monthly.info.forma;
      inv.lines.forEach(line => {

        if (!acc.sumInvoice[line.category]) {
          acc.sumInvoice[line.category] = {};
        }
        if (!acc.sumInvoice[line.category][forma]) {
          acc.sumInvoice[line.category][forma] = { sum: 0 };
        }
        acc.sumInvoice[line.category][forma].sum += (line.price * line.qtty);
      });
      return acc;
    }, { sumInvoice: {} } as ISummaryReportOutput);

    return output;
  },

  async generateEmployeesReportOutput(input: any): Promise<IEmployeesReportOutput> {

    let data = await AppDataSource.getRepository(StopperEntity).createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.march', 'm')
      .leftJoinAndSelect('m.monthly', 'o')
      .leftJoinAndSelect('o.client', 'c')
      .where('o.month = :month', { month: input.month })
      .andWhere('o.year = :year', { year: input.year })
      .getMany();

    let monthlyEntities = await AppDataSource.getRepository(MonthlyEntity).createQueryBuilder('m')
      .leftJoinAndSelect('m.marches', 'a')
      .leftJoinAndSelect('m.invoices', 'i')
      .leftJoinAndSelect('i.lines', 'l')
      .where('m.month = :month', { month: input.month })
      .andWhere('m.year = :year', { year: input.year })
      .getMany();

    let monthlies = monthlyEntities.map((val) => {
      let weigthSum = val.marches.reduce((acc, val) => acc + val.weight, 0);
      let invSum = val.invoices.reduce((acc, val) => acc + val.lines.reduce(
        (acc, val) => acc + val.price, 0), 0);

      return {
        monthlyId: val.id,
        weigthSum: weigthSum,
        invSum: invSum
      }
    });

    let marches = data.reduce((acc, stopper) => {
      let march = acc.find(m => m.marchId === stopper.march.id);
      if (!march) {
        acc.push({
          marchId: stopper.march.id,
          sumTime: stopper.seconds
        });
      } else {
        march.sumTime += stopper.seconds;
      }
      return acc;
    }, [] as { marchId: number, sumTime: number }[]);

    let output = data.reduce((acc, stopper) => {
      if (!acc[stopper.user.name]) {
        acc[stopper.user.name] = { sumValue: 0, entries: [] };
      }
      let monthly = monthlies.find(m => m.monthlyId == stopper.march.monthly.id);
      let weightSum = monthly.weigthSum;
      let marchValue = (stopper.march.weight / weightSum) * monthly.invSum;
      let stopperTimeSum = marches.find(m => m.marchId == stopper.march.id).sumTime;
      let stopperValue = (stopper.seconds / stopperTimeSum) * marchValue;

      acc[stopper.user.name].sumValue += stopperValue;

      let entry = acc[stopper.user.name].entries
        .find(e => e.client == stopper.march.monthly.client.name && e.stepName == stopper.march.name);

      if (entry) {
        entry.time += stopper.seconds;
        entry.value += stopperValue;
      } else {
        acc[stopper.user.name].entries.push({
          client: stopper.march.monthly.client.name,
          stepName: stopper.march.name,
          time: stopper.seconds,
          value: stopperValue
        });
      }

      return acc;
    }, {} as IEmployeesReportOutput);

    return output;
  },

  async generateBudgetReportOutput(input: IBudgetReportInput): Promise<IBudgetReportOutput> {
    let marches = await AppDataSource.getRepository(MarchEntity).createQueryBuilder('m')
      .leftJoinAndSelect('m.monthly', 'o')
      .leftJoinAndSelect('o.invoices', 'i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('m.stoppers', 's')
      .leftJoinAndSelect('o.client', 'c')
      .where('o.month = :month', { month: input.month })
      .andWhere('o.year = :year', { year: input.year })
      .getMany();

    let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .leftJoinAndSelect('m.client', 'c')
      .where('m.month = :month', { month: input.month })
      .andWhere('m.year = :year', { year: input.year })
      .getMany();

    let output: IBudgetReportOutput = {
      income: [],
      profit: 0,
      sumIncome: 0,
      categoryCost: [],
      profitShare: 0,
      divisionIncome: []
    };

    invoices.forEach(inv => {
      inv.lines.forEach(line => {
        if (!output.income.find(i => i.category == line.category)) {
          output.income.push({
            category: line.category,
            value: 0,
          });
        }
        output.income.find(i => i.category == line.category).value += line.price * line.qtty;
        output.sumIncome += line.price * line.qtty;

        if (!output.divisionIncome.find(i => i.division == inv.monthly.info.firma)) {
          output.divisionIncome.push({
            division: inv.monthly.info.firma,
            value: 0
          });
        }

        output.divisionIncome.find(i => i.division == inv.monthly.info.firma)
          .value += line.price * line.qtty;
      });
    });
    output.profit = output.sumIncome;

    input.cost.forEach(cost => {
      if (!output.categoryCost.find(c => c.category == cost.category)) {
        output.categoryCost.push({
          category: cost.category,
          sum: 0
        });
      }
      output.categoryCost.find(c => c.category == cost.category).sum += Number(cost.value);
    });

    output.categoryCost.forEach(cat => {
      cat.share = cat.sum / output.sumIncome;
      output.profit -= cat.sum;
    });

    output.profitShare = output.profit / output.sumIncome;

    return output;
  }
}
