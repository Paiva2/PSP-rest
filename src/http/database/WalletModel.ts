import { Big } from "big.js";
import { IPayableReceivers, IWallet, IWalletModel } from "../@types/types";
import { WalletRepository } from "../repositories/walletRepository";
import pool from "../lib/pg";

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
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
      walletOwner: wallet.wallet_owner,
    };
  }

  async findByWalletOwnerId(walletOwnerId: string): Promise<IWallet | null> {
    const { rows } = await pool.query(
      "SELECT * FROM tb_wallets WHERE wallet_owner = $1",
      [walletOwnerId]
    );

    if (!rows.length) return null;

    const wallet: IWalletModel = rows[0];

    return {
      id: wallet.id,
      available: wallet.available,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
      walletOwner: wallet.wallet_owner,
    };
  }

  async receivePayment(paymentInfos: {
    walletOwner: string;
    value: Big;
  }): Promise<IWallet> {
    const { rows } = await pool.query(
      `
    WITH current_val AS (
      SELECT available FROM tb_wallets WHERE wallet_owner = $1
    )
    
      UPDATE tb_wallets SET available = (SELECT * FROM current_val) + $2 WHERE wallet_owner = $1 
      RETURNING *
    `,
      [paymentInfos.walletOwner, paymentInfos.value.toNumber()]
    );

    const wallet: IWalletModel = rows[0];

    return {
      id: wallet.id,
      walletOwner: wallet.wallet_owner,
      available: wallet.available,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
    };
  }

  async receiveDayPayments(payments: IPayableReceivers[]): Promise<IWallet[]> {
    const query: string[] = [];

    payments.forEach((payment, idx) => {
      query.push(`
      WITH current_val${idx} AS (
        SELECT available FROM tb_wallets WHERE id = '${payment.walletId}'
      )
  
      UPDATE tb_wallets
      SET available = (SELECT * FROM current_val${idx}) + ${new Big(
        payment.value
      ).toNumber()},
        updated_at = now()
      WHERE id = '${payment.walletId}';
      `);
    });

    const { rows } = await pool.query(query.join("--").replaceAll("--", ""));

    return rows;
  }
}
