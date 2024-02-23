import { Express } from "express";
import UserCreationController from "../controllers/user/UserCreationController";

const prefix = "api/v1/user"; //FIX

export default function userRoutes(app: Express) {
  app.post(`${prefix}/register`, UserCreationController.handle);
}
