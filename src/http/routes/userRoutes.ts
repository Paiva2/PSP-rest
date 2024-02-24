import { Express } from "express";
import UserCreationController from "../controllers/user/UserCreationController";
import UserAuthController from "../controllers/user/userAuthController";

export default function userRoutes(app: Express) {
  app.post(`/register`, UserCreationController.handle);

  app.post("/login", UserAuthController.handle);
}
