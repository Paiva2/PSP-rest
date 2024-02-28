import { Request, Response } from "express";
import JwtService from "../../services/jwt/JwtService";
import UserFactory from "./factory";

export default class CheckOwnWalletController {
  public static async handle(req: Request, res: Response) {
    const jwtService = new JwtService();

    const userId = jwtService.decode(
      req.headers.authorization?.replace("Bearer ", "")!
    );

    const factory = new UserFactory();

    const { checkOwnWalletService } = await factory.exec();

    try {
      const userValues = await checkOwnWalletService.exec(userId);

      return res.status(200).send(userValues);
    } catch (e) {
      console.log(e);
    }
  }
}
