import express, { Express } from "express";
import bodyParser from "body-parser";
import userRoutes from "./http/routes/userRoutes";
import pool from "./http/lib/pg";
import dbSetup from "./http/utils/dbSetup";
import "dotenv/config";
import "express-async-errors";
import globalExceptionHandler from "./http/middlewares/GlobalExceptionHandler";

const app: Express = express();

app.use(bodyParser.json());

userRoutes(app);

(async function dbConnectionTest() {
  try {
    const clientTest = await pool.connect();

    console.log("Database running on port: " + process.env.DB_PORT);

    clientTest.release();

    await dbSetup();
  } catch (e) {
    console.log("Error while connecting with database...", e);
  }
})();

app.use(globalExceptionHandler);

export default app;
