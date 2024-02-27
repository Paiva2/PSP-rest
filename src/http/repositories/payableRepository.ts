import { IPayable, IPayableCreation, IPayableReceivers } from "../@types/types";

export default interface PayableRepository {
  save(newPayable: IPayableCreation): Promise<IPayable>;

  receiversOfDay(): Promise<IPayableReceivers[]>;
}
