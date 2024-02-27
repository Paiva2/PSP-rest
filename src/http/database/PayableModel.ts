import {
  IPayableCreation,
  IPayable,
  IPayableModel,
  IPayableReceivers,
  IPayableReceiversModel,
} from "../@types/types";
import pool, { pgClient } from "../lib/pg";
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

  async receiversOfDay(): Promise<IPayableReceivers[]> {
    const { rows } = await pool.query(`
    SELECT 
    p.id as payable_id, 
    p.transaction_id, 
    tc.receiver_id, wall.id as wallet_id,
    p.value 
    FROM tb_payables p
    LEFT JOIN tb_transactions tc ON tc.id = p.transaction_id
    JOIN tb_wallets wall on wall.wallet_owner = tc.receiver_id
    WHERE p.status  = 'waiting_funds' and DATE(p.payment_date) = CURRENT_DATE;`);

    const payablesOfDay: IPayableReceiversModel[] = rows;

    if (!payablesOfDay.length) return [];

    const ids = payablesOfDay.map((payable) => `'${payable.payable_id}'`);

    await pool.query(
      `UPDATE tb_payables SET status = 'paid' WHERE id IN (${ids})`
    );

    return payablesOfDay.reduce(
      (acc: IPayableReceivers[], payable: IPayableReceiversModel) => {
        return [
          ...acc,
          {
            payableId: payable.payable_id,
            receiverId: payable.receiver_id,
            transactionId: payable.transaction_id,
            value: payable.value,
            walletId: payable.wallet_id,
          },
        ];
      },
      []
    );
  }
}
