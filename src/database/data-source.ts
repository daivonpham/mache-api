import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import configuration from "../config/configuration";

dotenv.config();

const config = configuration();

export const dataSourceOptions: DataSourceOptions = {
  type: (config.database.db as any) || "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: config.env !== "production",
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
