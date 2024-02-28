import { Express } from "express";
import { zodDtoValidation } from "../middlewares/zodDtoValidation";
import { createTransactionDTO } from "../dtos/transactionDto";
import CreateTransactionController from "../controllers/transactions/createTransactionController";
import ListOwnTransactionsController from "../controllers/transactions/listOwnTransactionsController";
import jwtHandler from "../middlewares/jwtHandler";

export default function transactionRoutes(app: Express) {
  app.post(
    "/transaction",
    [jwtHandler, zodDtoValidation(createTransactionDTO)],
    CreateTransactionController.handle
  );

  app.get("/transactions", [jwtHandler], ListOwnTransactionsController.handle);
}
