import Big from "big.js";
import { WalletRepository } from "../repositories/walletRepository";
import { IWallet } from "../@types/types";
import { randomUUID } from "node:crypto";

export default class InMemoryWalletRepository implements WalletRepository {
  protected wallets = [] as IWallet[];

  public async create(walletOwnerId: string): Promise<IWallet> {
    const wallet = {
      id: randomUUID(),
      available: new Big(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      walletOwner: walletOwnerId,
    };

    this.wallets.push(wallet);

    return wallet;
  }

  public async findByWalletOwnerId(
    walletOwnerId: string
  ): Promise<IWallet | null> {
    const wallet = this.wallets.find(
      (wallet) => wallet.walletOwner === walletOwnerId
    );

    if (!wallet) return null;

    return wallet;
  }

  async receivePayment(paymentInfos: {
    walletOwner: string;
    value: Big.Big;
  }): Promise<IWallet> {
    this.wallets = this.wallets.map((wallet) => {
      if (wallet.walletOwner === paymentInfos.walletOwner) {
        wallet.available = wallet.available.add(paymentInfos.value);
      }

      return wallet;
    });

    return this.wallets.find(
      (wallet) => wallet.walletOwner === paymentInfos.walletOwner
    )!;
  }
}
