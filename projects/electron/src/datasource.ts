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
import { MonthlyUpdateEntity } from './entity/MonthlyUpdate';
import { migrations } from './migration/migrations';

export let AppDataSource: DataSource;

export const initializeDatabase = async (options: any) => {
  let configDefault = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "pg",
    database: "biuro",
    synchronize: true,
    logging: true,
    entities: [
      UserEntity, 
      ClientEntity, 
      MonthlyEntity, 
      MarchEntity, 
      StopperEntity, 
      InvoiceEntity, 
      InvoiceLineEntity, 
      ListValueEntity, 
      NoteEntity, 
      ReportEntity,
      MonthlyUpdateEntity
    ],
    migrations: migrations,
  }
  let config = { ...configDefault, ...options };
  AppDataSource = new DataSource(config);

  return AppDataSource.initialize();
};