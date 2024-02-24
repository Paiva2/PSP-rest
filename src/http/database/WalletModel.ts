import { IWallet, IWalletModel } from "../@types/types";
import pool from "../lib/pg";
import { WalletRepository } from "../repositories/walletRepository";

export default class WalletModel implements WalletRepository {
  async create(walletOwnerId: string): Promise<IWallet> {
    const { rows } = await pool.query(
      "INSERT INTO tb_wallets (wallet_owner) VALUES ($1) RETURNING *",
      [walletOwnerId]
    );

    const wallet: IWalletModel = rows[0];

    return {
      id: wallet.id,
      available: wallet.available,
      waitingFunds: wallet.waiting_funds,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
      walletOwner: wallet.wallet_owner,
    };
  }
}
