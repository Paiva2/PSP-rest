import express, { Express } from "express";
import bodyParser from "body-parser";
import userRoutes from "./http/routes/userRoutes";

const app: Express = express();

app.use(bodyParser.json());

app.use(userRoutes);

export default app;
