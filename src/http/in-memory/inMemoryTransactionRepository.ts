import {
  ITransaction,
  IPayable,
  ITransactionSave,
  ITransactionAndPayable,
  ITransactionAndPayablePaginated,
} from "../@types/types";
import PayableRepository from "../repositories/payableRepository";
import TransactionRepository from "../repositories/transactionRepository";
import { randomUUID } from "node:crypto";

export default class InMemoryTransactionRepository
  implements TransactionRepository
{
  public transactions = [] as ITransaction[];

  public constructor(private readonly payableRepository?: PayableRepository) {}

  public async save({ payable, transaction }: ITransactionSave): Promise<{
    transaction: ITransaction;
    payable: IPayable;
  }> {
    const newTransaction = {
      id: randomUUID(),
      value: transaction.value,
      method: transaction.method,
      cardNumber: transaction.cardNumber,
      cardValidationDate: transaction.cardValidationDate,
      cardCvv: transaction.cardCvv,
      description: transaction.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      payerId: transaction.payerId,
      receiverId: transaction.receiverId,
    };

    this.transactions.push(newTransaction);

    const newPayable = await this.payableRepository?.save({
      ...payable,
      transactionId: newTransaction.id,
    });

    return {
      transaction: newTransaction,
      payable: newPayable!,
    };
  }

  public async findById(transactionId: string): Promise<ITransaction | null> {
    const find = this.transactions.find(
      (transaction) => transaction.id === transactionId
    );

    if (!find) return null;

    return find;
  }

  async findAllByUserId(
    userId: string,
    page: number,
    perPage: number
  ): Promise<ITransactionAndPayablePaginated> {
    const findUserTransactions = this.transactions.filter(
      (transaction) =>
        transaction.receiverId === userId || transaction.payerId === userId
    );

    let transactionsFormat = [] as ITransactionAndPayable[];

    await findUserTransactions.forEach(async (transaction) => {
      const getTransaction: ITransactionAndPayable = {
        ...transaction,
        payable: {} as IPayable,
      };

      const transactionPayables =
        await this.payableRepository?.findByTransactionId(transaction.id!);

      if (transactionPayables) {
        getTransaction.payable = transactionPayables;
      }

      transactionsFormat.push(getTransaction);
    });

    return {
      page,
      perPage,
      totalItens: transactionsFormat.length,
      transactions: transactionsFormat.splice(
        (page - 1) * perPage,
        perPage * page
      ),
    };
  }
}
