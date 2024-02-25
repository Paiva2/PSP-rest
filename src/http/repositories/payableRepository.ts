import { IPayable, IPayableCreation } from "../@types/types";

export default interface PayableRepository {
  save(newPayable: IPayableCreation): Promise<IPayable>;
}
