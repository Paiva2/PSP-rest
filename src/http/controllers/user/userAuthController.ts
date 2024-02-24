import { Request, Response } from "express";
import UserFactory from "./factory";
import JwtService from "../../services/jwt/JwtService";

export default class UserAuthController {
  public static async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    const factory = new UserFactory();
    const jwtService = new JwtService();

    const { userAuthService } = await factory.exec();

    const user = await userAuthService.exec({
      email,
      password,
    });

    const tokenGenerator = jwtService.sign(user.id);

    return res.status(200).send({ token: tokenGenerator });
  }
}
