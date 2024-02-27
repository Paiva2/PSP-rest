import { randomUUID } from "node:crypto";
import { IPayableCreation, IPayable, IPayableReceivers } from "../@types/types";
import PayableRepository from "../repositories/payableRepository";
import InMemoryWalletRepository from "./inMemoryWalletRepository";
import InMemoryTransactionRepository from "./inMemoryTransactionRepository";
import dayjs from "dayjs";

export default class InMemoryPayableRepository implements PayableRepository {
  protected payables = [] as IPayable[];

  private walletRepository = new InMemoryWalletRepository();
  private transactionRepository = new InMemoryTransactionRepository();

  constructor() {}

  public getWalletRepository() {
    return this.walletRepository;
  }

  public setWalletRepository(repository: InMemoryWalletRepository) {
    this.walletRepository = repository;
  }

  public getTransactionRepository() {
    return this.transactionRepository;
  }

  public setTransactionRepository(repository: InMemoryTransactionRepository) {
    this.transactionRepository = repository;
  }

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

  //FIX UPDATE STATUS
  public async receiversOfDay(): Promise<IPayableReceivers[]> {
    let receivers = [] as IPayableReceivers[];

    await this.payables.forEach(async (payable) => {
      if (!dayjs(payable.paymentDate).isSame(dayjs())) return;

      const payableTransaction = await this.transactionRepository?.findById(
        payable.transactionId
      );

      const payableReceiverWallet =
        await this.walletRepository?.findByWalletOwnerId(
          payableTransaction?.receiverId!
        );

      if (!payableTransaction || !payableReceiverWallet) return;

      receivers.push({
        transactionId: payable.transactionId,
        payableId: payable.id,
        receiverId: payableTransaction.receiverId,
        value: payable.value,
        walletId: payableReceiverWallet.id,
      });
    });

    return receivers;
  }
}
