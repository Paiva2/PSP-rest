import { Client, Pool } from "pg";
import "dotenv/config";

const config = {
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: +process.env.DB_PORT! as number,
  max: 20,
};

const pool = new Pool(config);

export const pgClient = new Client(config);

export default pool;
