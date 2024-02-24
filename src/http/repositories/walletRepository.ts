import { IWallet } from "../@types/types";

export interface WalletRepository {
  create(walletOwnerId: string): Promise<IWallet>;
}
