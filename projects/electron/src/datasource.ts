import { DataSource } from 'typeorm';
import { UserEntity } from './entity/User';
import { ClientEntity } from './entity/Client';
import { MonthlyEntity } from './entity/Monthly';
import { MarchEntity } from './entity/March';
import { StopperEntity } from './entity/Stopper';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "pg",
  database: "biuro",
  synchronize: true,
  //logging: true,
  entities: [UserEntity, ClientEntity, MonthlyEntity, MarchEntity, StopperEntity],
  subscribers: [],
  migrations: [],
});