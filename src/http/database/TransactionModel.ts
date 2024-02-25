import {
  ITransactionSave,
  ITransaction,
  IPayable,
  IPayableModel,
  ITransactionModel,
} from "../@types/types";
import pool from "../lib/pg";
import TransactionRepository from "../repositories/transactionRepository";

export default class TransactionModel implements TransactionRepository {
  public async save({ transaction, payable }: ITransactionSave): Promise<{
    transaction: ITransaction;
    payable: IPayable;
  }> {
    let newTransaction = {} as ITransactionModel;
    let newPayable = {} as IPayableModel;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: transactionRows } = await client.query(
        `
        INSERT INTO tb_transactions
            (value, method, card_number, card_validation_date, card_cvv, description, payer_id, receiver_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
        `,
        [
          transaction.value.toNumber(),
          transaction.method,
          transaction.cardNumber,
          transaction.cardValidationDate,
          transaction.cardCvv,
          transaction.description,
          transaction.payerId,
          transaction.receiverId,
        ]
      );

      newTransaction = transactionRows[0];

      const { rows: payableRows } = await client.query(
        `
            INSERT INTO tb_payables
                (value, payment_date, fee, status, transaction_id)
                VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
            `,
        [
          payable.payableAmount.toNumber(),
          payable.payableDate,
          payable.payableFee.toNumber(),
          payable.payableStatus,
          newTransaction.id,
        ]
      );

      await client.query("COMMIT");

      newPayable = payableRows[0];
    } catch (e) {
      await client.query("ROLLBACK");

      console.log(e);

      throw new Error("Error while creating new transaction and payable...");
    } finally {
      client.release();
    }

    return {
      transaction: {
        id: newTransaction.id,
        cardValidationDate: newTransaction.card_validation_date,
        cardCvv: newTransaction.card_cvv,
        cardNumber: newTransaction.card_number,
        description: newTransaction.description,
        method: newTransaction.method,
        payerId: newTransaction.payer_id,
        receiverId: newTransaction.receiver_id,
        value: newTransaction.value,
        createdAt: newTransaction.created_at,
        updatedAt: newTransaction.updated_at,
      },
      payable: {
        id: newPayable.id,
        paymentDate: newPayable.payment_date,
        value: newPayable.value,
        fee: newPayable.fee,
        status: newPayable.status,
        transactionId: newPayable.transaction_id,
        createdAt: newPayable.created_at,
        updatedAt: newPayable.updated_at,
      },
    };
  }
}
