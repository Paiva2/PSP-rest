import TransactionModel from "../../../database/TransactionModel";
import UserModel from "../../../database/UserModel";
import WalletModel from "../../../database/WalletModel";
import { CreateTransactionService } from "../../../services/transactions/createTransactionService";

export default class TransactionFactory {
  public async exec() {
    const models = this.models();

    const createTransactionService = new CreateTransactionService(
      models.userRepository,
      models.transactionRepository,
      models.walletRepository
    );

    return {
      createTransactionService,
    };
  }

  private models() {
    const userRepository = new UserModel();
    const walletRepository = new WalletModel();
    const transactionRepository = new TransactionModel();

    return {
      userRepository,
      walletRepository,
      transactionRepository,
    };
  }
}
