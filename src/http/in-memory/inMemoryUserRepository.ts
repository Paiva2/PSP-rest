import { IUser, IUserCreation } from "../@types/types";
import { UserRepository } from "../repositories/userRepository";
import { randomUUID } from "node:crypto";

export default class InMemoryUserRepository implements UserRepository {
  protected users = [] as IUser[];

  public async findByEmail(email: string): Promise<IUser | null> {
    const findUserByEmail = this.users.find((user) => user.email === email);

    if (!findUserByEmail) return null;

    return findUserByEmail;
  }

  public async save(newUser: IUserCreation): Promise<IUser> {
    const user = {
      id: randomUUID(),
      ...newUser,
      passwordHash: newUser.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);

    return user;
  }
}
