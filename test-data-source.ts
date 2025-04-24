import { DataSource } from "typeorm";
import { AddMonthlyUpdatesTriggers1744798193499 } from "./projects/electron/src/migration/01/1744798193499-AddMonthlyUpdatesTriggers";

export default new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "pg",
  database: "biuro",
  entities: [],
  migrations: [AddMonthlyUpdatesTriggers1744798193499],
});

//npx ts-node ./node_modules/typeorm/cli.js migration:run --dataSource my-data-source.ts
