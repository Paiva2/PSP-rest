import { Express } from "express";
import CreateTransactionController from "../controllers/transactions/createTransactionController";
import jwtHandler from "../middlewares/jwtHandler";
import { zodDtoValidation } from "../middlewares/zodDtoValidation";
import { createTransactionDTO } from "../dtos/transactionDto";

export default function transactionRoutes(app: Express) {
  app.post(
    "/transaction",
    [jwtHandler, zodDtoValidation(createTransactionDTO)],
    CreateTransactionController.handle
  );
}
