import { Request, Response } from "express";
import UserFactory from "./factory";

export default class UserCreationController {
  public static async handle(req: Request, res: Response) {
    const { newUser } = req.body;

    const factory = new UserFactory();
    const { userCreationService } = await factory.exec();

    await userCreationService.exec(newUser);

    return res.status(201).send({ message: "User created successfully." });
  }
}
