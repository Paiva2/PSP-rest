import { IPayable, ITransaction, ITransactionSave } from "../@types/types";

export default interface TransactionRepository {
  save(transactionDto: ITransactionSave): Promise<{
    transaction: ITransaction;
    payable: IPayable;
  }>;

  findById(transactionId: string): Promise<ITransaction | null>;
}
