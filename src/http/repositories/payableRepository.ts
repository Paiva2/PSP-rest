import { IPayable, IPayableCreation, IPayableReceivers } from "../@types/types";

export default interface PayableRepository {
  save(newPayable: IPayableCreation): Promise<IPayable>;

  receiversOfDay(): Promise<IPayableReceivers[]>;

  findByTransactionId(transactionId: string): Promise<IPayable | null>;

  findAllUserWaitingFunds(userId: string): Promise<IPayable[]>;
}
