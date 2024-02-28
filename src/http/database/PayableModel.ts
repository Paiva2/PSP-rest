import {
  IPayableCreation,
  IPayable,
  IPayableModel,
  IPayableReceivers,
  IPayableReceiversModel,
} from "../@types/types";
import pool, { pgClient } from "../lib/pg";
import PayableRepository from "../repositories/payableRepository";
import formatBrl from "../utils/formatBrl";
import Big from "big.js";

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
    WHERE p.status = 'waiting_funds' and DATE(p.payment_date) = CURRENT_DATE;`);

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

  async findByTransactionId(transactionId: string): Promise<IPayable | null> {
    const { rows } = await pool.query(
      "SELECT * FROM tb_payables WHERE transaction_id = $1",
      [transactionId]
    );

    if (!rows.length) return null;

    const find: IPayableModel = rows[0];

    return {
      id: find.id,
      value: find.value,
      fee: find.fee,
      status: find.status,
      paymentDate: find.payment_date,
      transactionId: find.transaction_id,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
    };
  }

  async findAllUserWaitingFunds(userId: string): Promise<IPayable[]> {
    const { rows } = await pool.query(
      `
      SELECT pb.id, 
        pb.status, pb.value, 
        pb.fee, 
        pb.payment_date, 
        pb.created_at, 
        pb.updated_at, 
        pb.transaction_id 
      FROM tb_payables pb 
      INNER JOIN tb_transactions tc 
      ON tc.receiver_id = $1 AND tc.id = pb.transaction_id 
      WHERE pb.status = 'waiting_funds'; 
    `,
      [userId]
    );

    if (!rows.length) return [];

    const payables: IPayableModel[] = rows;

    return payables.map((payable) => {
      return {
        id: payable.id,
        status: payable.status,
        value: payable.value,
        fee: payable.fee,
        paymentDate: payable.payment_date,
        transactionId: payable.transaction_id,
        createdAt: payable.created_at,
        updatedAt: payable.updated_at,
      };
    });
  }
}
