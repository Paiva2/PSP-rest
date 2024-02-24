import { IUser, IUserCreation } from "../@types/types";

export interface UserRepository {
  findByEmail(email: string): Promise<IUser | null>;

  save(newUser: IUserCreation): Promise<IUser>;

  findById(id: string): Promise<IUser | null>;
}
