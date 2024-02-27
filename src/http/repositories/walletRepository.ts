import Big from "big.js";
import { IPayableReceivers, IWallet } from "../@types/types";

export interface WalletRepository {
  create(walletOwnerId: string): Promise<IWallet>;

  findByWalletOwnerId(walletOwnerId: string): Promise<IWallet | null>;

  receivePayment(paymentInfos: {
    walletOwner: string;
    value: Big;
  }): Promise<IWallet>;

  receiveDayPayments(payments: IPayableReceivers[]): Promise<IWallet[]>;
}
