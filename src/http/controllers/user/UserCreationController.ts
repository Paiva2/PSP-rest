import { Request, Response } from "express";
import UserFactory from "./factory";

//TODO
export default class UserCreationController {
  public static async handle(req: Request, res: Response) {
    const factory = new UserFactory();

    const { userCreationService } = await factory.exec();
  }
}
