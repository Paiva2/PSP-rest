import { IUser, IUserCreation } from "../@types/types";
import { UserRepository } from "../repositories/userRepository";
import { WalletRepository } from "../repositories/walletRepository";
import { randomUUID } from "node:crypto";

export default class InMemoryUserRepository implements UserRepository {
  protected users = [] as IUser[];

  constructor(private readonly walletRepository?: WalletRepository) {}

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

  public async findByEmail(email: string): Promise<IUser | null> {
    const findUserByEmail = this.users.find((user) => user.email === email);

    if (!findUserByEmail) return null;

    const userWallet = await this.walletRepository?.findByWalletOwnerId(
      findUserByEmail?.id
    );

    return {
      ...findUserByEmail,
      wallet: userWallet!,
    };
  }

  async findById(id: string): Promise<IUser | null> {
    const findUserById = this.users.find((user) => user.id === id);

    if (!findUserById) return null;

    const userWallet = await this.walletRepository?.findByWalletOwnerId(
      findUserById?.id
    );

    return {
      ...findUserById,
      wallet: userWallet!,
    };
  }
}
