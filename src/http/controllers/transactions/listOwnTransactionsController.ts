import { Request, Response } from "express";
import JwtService from "../../services/jwt/JwtService";
import TransactionFactory from "./factory";

export default class ListOwnTransactionsController {
  public static async handle(request: Request, response: Response) {
    const jwtService = new JwtService();

    let { page, perPage } = request.query as {
      page: string;
      perPage: string;
    };

    const token = jwtService.decode(
      request.headers.authorization?.replaceAll("Bearer ", "")!
    );

    const factory = new TransactionFactory();

    const { listOwnTransactionsService } = await factory.exec();

    if (!page) page = "1";
    if (!perPage) perPage = "5";

    const list = await listOwnTransactionsService.exec({
      page: +page,
      perPage: +perPage,
      userId: token,
    });

    return response.status(200).send(list);
  }
}
