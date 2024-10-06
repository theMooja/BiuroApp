import { DataSource } from 'typeorm';
import { UserEntity } from './entity/User';
import { Client } from './entity/Client';
import { Monthly } from './entity/Monthly';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "pg",
  database: "biuro",
  synchronize: true,
  //logging: true,
  entities: [UserEntity, Client, Monthly],
  subscribers: [],
  migrations: [],
});