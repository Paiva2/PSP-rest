import { IWallet } from "../@types/types";
import { WalletRepository } from "../repositories/walletRepository";
import { randomUUID } from "node:crypto";

export default class InMemoryWalletRepository implements WalletRepository {
  protected wallets = [] as IWallet[];

  public async create(walletOwnerId: string): Promise<IWallet> {
    const wallet = {
      id: randomUUID(),
      available: 0,
      waitingFunds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      walletOwner: walletOwnerId,
    };

    this.wallets.push(wallet);

    return wallet;
  }
}
