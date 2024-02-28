import PayableModel from "../../../database/PayableModel";
import TransactionModel from "../../../database/TransactionModel";
import UserModel from "../../../database/UserModel";
import WalletModel from "../../../database/WalletModel";
import { CreateTransactionService } from "../../../services/transactions/createTransactionService";
import ListOwnTransactionsService from "../../../services/transactions/listOwnTransactionsService";
import WaitingFundsTransactionService from "../../../services/transactions/waitingFundsTransactionService";

export default class TransactionFactory {
  public async exec() {
    const models = this.models();

    const createTransactionService = new CreateTransactionService(
      models.userRepository,
      models.transactionRepository,
      models.walletRepository
    );

    const waitingFundsTransactionService = new WaitingFundsTransactionService(
      models.walletRepository,
      models.payableRepository
    );

    const listOwnTransactionsService = new ListOwnTransactionsService(
      models.userRepository,
      models.transactionRepository
    );

    return {
      createTransactionService,
      waitingFundsTransactionService,
      listOwnTransactionsService,
    };
  }

  private models() {
    const userRepository = new UserModel();
    const walletRepository = new WalletModel();
    const transactionRepository = new TransactionModel();
    const payableRepository = new PayableModel();

    return {
      userRepository,
      walletRepository,
      transactionRepository,
      payableRepository,
    };
  }
}
