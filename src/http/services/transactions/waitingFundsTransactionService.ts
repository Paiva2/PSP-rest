import PayableRepository from "../../repositories/payableRepository";
import { WalletRepository } from "../../repositories/walletRepository";
import type { IWallet } from "../../@types/types";

//TODO TESTS
export default class WaitingFundsTransactionService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly payableRepository: PayableRepository
  ) {}

  public async exec(): Promise<IWallet[]> {
    const receiversFromDay = await this.payableRepository.receiversOfDay();

    const givePayToWallets = await this.walletRepository.receiveDayPayments(
      receiversFromDay
    );

    return givePayToWallets;
  }
}
