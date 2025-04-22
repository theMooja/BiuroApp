import { DataSource } from "typeorm";
import { AddMonthlyUpdatesTriggers1744798193499 } from "./projects/electron/src/migration/01/1744798193499-AddMonthlyUpdatesTriggers";

export default new DataSource({
  type: "postgres",
  host: "192.168.3.10",
  port: 5432,
  username: "postgres",
  password: "pgf1nka",
  database: "biuro",
  entities: [],
  migrations: [AddMonthlyUpdatesTriggers1744798193499], // Or wherever your migrations live
});

//npx ts-node ./node_modules/typeorm/cli.js migration:run --dataSource my-data-source.ts
