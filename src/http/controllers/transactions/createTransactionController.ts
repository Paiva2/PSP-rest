import { Request, Response } from "express";
import TransactionFactory from "./factory";
import JwtService from "../../services/jwt/JwtService";

export default class CreateTransactionController {
  public static async handle(request: Request, response: Response) {
    const transaction = request.body;

    const factory = new TransactionFactory();
    const jwtService = new JwtService();

    const { createTransactionService } = await factory.exec();

    const userToken = jwtService.decode(
      request.headers.authorization!.replace("Bearer ", "")
    );

  try {
    const transactionCreated = await createTransactionService.exec({
      ...transaction,
      payerId: userToken,
    });
    return response.status(201).send(transactionCreated);
  }catch(e) {
    console.log(e)
  }
}
}
