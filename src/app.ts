import express, { Express } from "express";
import bodyParser from "body-parser";

const app: Express = express();

app.use(bodyParser.json());

app.get("/test", (req, res) => {
  return res.status(200).send({ message: "Hello World" });
});

export default app;
