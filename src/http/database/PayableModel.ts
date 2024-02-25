import { IPayableCreation, IPayable, IPayableModel } from "../@types/types";
import { pgClient } from "../lib/pg";
import PayableRepository from "../repositories/payableRepository";

export default class PayableModel implements PayableRepository {
  public async save(newPayable: IPayableCreation): Promise<IPayable> {
    const { rows } = await pgClient.query(
      `
      INSERT INTO tb_payables
          (value, payment_date, fee, status, transaction_id)
          VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
      `,
      [
        newPayable.payableAmount,
        newPayable.payableDate,
        newPayable.payableFee,
        newPayable.payableStatus,
        newPayable.transactionId,
      ]
    );

    const payable: IPayableModel = rows[0];

    return {
      id: payable.id,
      value: payable.value,
      fee: payable.fee,
      status: payable.status,
      paymentDate: payable.payment_date,
      createdAt: payable.created_at,
      updatedAt: payable.updated_at,
      transactionId: payable.transaction_id,
    };
  }
}
