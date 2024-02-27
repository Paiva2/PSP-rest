import { ITransaction, IPayable, ITransactionSave } from "../@types/types";
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
}
