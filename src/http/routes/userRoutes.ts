import { Express } from "express";
import { zodDtoValidation } from "../middlewares/zodDtoValidation";
import { authUserDTO, userCreationDTO } from "../dtos/userDtos";
import UserCreationController from "../controllers/user/UserCreationController";
import UserAuthController from "../controllers/user/userAuthController";

export default function userRoutes(app: Express) {
  app.post(
    `/register`,
    [zodDtoValidation(userCreationDTO)],
    UserCreationController.handle
  );

  app.post(
    "/login",
    [zodDtoValidation(authUserDTO)],
    UserAuthController.handle
  );
}
