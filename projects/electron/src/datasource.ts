import { DataSource } from 'typeorm';
import { UserEntity } from './entity/User';
import { ClientEntity } from './entity/Client';
import { MonthlyEntity } from './entity/Monthly';
import { MarchEntity } from './entity/March';
import { StopperEntity } from './entity/Stopper';
import { InvoiceEntity } from './entity/Invoice';
import { InvoiceLineEntity } from './entity/InvoiceLine';
import { ListValueEntity } from './entity/ListValue';
import { NoteEntity } from './entity/Note';
import { ReportEntity } from './entity/Report';

export let AppDataSource: DataSource;

export const initializeDatabase = async (options: any) => {
  let config = {
    type: "postgres",
    host: "192.168.3.10",
    port: 5432,
    username: "postgres",
    password: "pgf1nka",
    database: "test",
    synchronize: true,
    logging: true,
    entities: [UserEntity, ClientEntity, MonthlyEntity, MarchEntity, StopperEntity, InvoiceEntity, InvoiceLineEntity, ListValueEntity, NoteEntity, ReportEntity],
  }
  AppDataSource = new DataSource({ ...config, ...options });

  return AppDataSource.initialize();
};