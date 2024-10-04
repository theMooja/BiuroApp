import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Client } from './entity/Client';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "pg",
  database: "biuro",
  synchronize: true,
  logging: true,
  entities: [User, Client],
  subscribers: [],
  migrations: [],
});