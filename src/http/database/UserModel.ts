import { IUser, IUserCreation } from "../@types/types";
import { UserRepository } from "../repositories/userRepository";

export default class UserModel implements UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    throw new Error("Method not implemented.");
  }
  async save(newUser: IUserCreation): Promise<IUser> {
    throw new Error("Method not implemented.");
  }
}
