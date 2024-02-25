import { IPayableCreation, IPayable } from "../@types/types";
import PayableRepository from "../repositories/payableRepository";
import { randomUUID } from "node:crypto";

export default class InMemoryPayableRepository implements PayableRepository {
  protected payables = [] as IPayable[];

  public async save(newPayable: IPayableCreation): Promise<IPayable> {
    const payable = {
      id: randomUUID(),
      status: newPayable.payableStatus,
      value: newPayable.payableAmount,
      fee: newPayable.payableFee,
      paymentDate: newPayable.payableDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionId: newPayable.transactionId!,
    };

    this.payables.push(payable);

    return payable;
  }
}
