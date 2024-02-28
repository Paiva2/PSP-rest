import {
  IPayable,
  ITransaction,
  ITransactionAndPayablePaginated,
  ITransactionSave,
} from "../@types/types";

export default interface TransactionRepository {
  save(transactionDto: ITransactionSave): Promise<{
    transaction: ITransaction;
    payable: IPayable;
  }>;

  findById(transactionId: string): Promise<ITransaction | null>;

  findAllByUserId(
    userId: string,
    page: number,
    perPage: number
  ): Promise<ITransactionAndPayablePaginated>;
}
