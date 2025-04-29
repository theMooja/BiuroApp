import { AppDataSource } from "../datasource";
import { ClientEntity } from "../entity/Client";
import { MarchEntity } from "../entity/March";
import { MonthlyEntity } from "../entity/Monthly";
import { NoteEntity } from "../entity/Note";
import { UserEntity } from "../entity/User";
import { IMonthlyEntity, INoteEntity, IClientEntity, IMarchEntity } from "../interfaces";
import { In } from "typeorm";
import { ClientController } from "./ClientController";

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
        .leftJoinAndSelect('mar.owner', 'o')
        .leftJoinAndSelect('m.notes', 'not')
        .leftJoinAndSelect('not.user', 'user')
        .where('m.id = :id', { id })
        .orderBy('mar.sequence', 'ASC')
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
        let monthlies = await AppDataSource
          .getRepository(MonthlyEntity).find({
            where: { year, month },
            relations: ['client']
          });
        clients = clients.filter(c => !monthlies.some(m => m.client.id == c.id));
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