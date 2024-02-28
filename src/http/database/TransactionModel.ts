import Big from "big.js";
import {
  ITransactionSave,
  ITransaction,
  IPayable,
  IPayableModel,
  ITransactionModel,
  ITransactionAndPayablePaginated,
  ITransactionAndPayable,
} from "../@types/types";
import pool from "../lib/pg";
import TransactionRepository from "../repositories/transactionRepository";
import formatBrl from "../utils/formatBrl";

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

  async findById(transactionId: string): Promise<ITransaction | null> {
    const { rows } = await pool.query(
      "SELECT * FROM tb_transactions WHERE id = $1",
      [transactionId]
    );

    const find: ITransactionModel = rows[0];

    if (!find) return null;

    return {
      id: find.id,
      cardCvv: find.card_cvv,
      cardNumber: find.card_number,
      cardValidationDate: find.card_validation_date,
      description: find.description,
      method: find.method,
      payerId: find.payer_id,
      receiverId: find.receiver_id,
      value: find.value,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
    };
  }

  async findAllByUserId(
    userId: string,
    page: number,
    perPage: number
  ): Promise<ITransactionAndPayablePaginated> {
    const { rows } = await pool.query(
      `
    SELECT
      tc.id,
      tc.value,
      tc.method,
      tc.card_number,
      tc.card_validation_date,
      tc.card_cvv,
      tc.description,
      tc.created_at,
      tc.updated_at,
      tc.receiver_id,
      tc.payer_id,
      pb.id as payableId, 
      pb.status, 
      pb.value as payableValue,
      pb.fee, 
      pb.payment_date,
      pb.created_at as payableCreatedAt,
      pb.updated_at as payableUpdatedAt
    FROM tb_transactions tc JOIN tb_payables pb 
      ON tc.id = pb.transaction_id 
    WHERE tc.payer_id = $1 OR tc.receiver_id = $1
    ORDER BY created_at DESC
    LIMIT $3 OFFSET ($2 - 1) * $3
`,
      [userId, page, perPage]
    );

    const formatReturn = rows.reduce((acc: ITransactionAndPayable[], item) => {
      return [
        ...acc,
        {
          id: item.id,
          value: formatBrl(new Big(item.value)),
          method: item.method,
          cardNumber: item.card_number,
          cardValidationDate: item.card_validation_date,
          cardCvv: item.card_cvv,
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          payerId: item.payer_id,
          receiverId: item.receiver_id,
          payable: {
            id: item.payableid,
            status: item.status,
            value: formatBrl(new Big(item.payablevalue)),
            fee: formatBrl(new Big(item.fee)),
            paymentDate: item.payment_date,
            createdAt: item.payablecreatedat,
            updatedAt: item.payableupdatedat,
          },
        },
      ];
    }, []);

    return {
      page,
      perPage,
      totalItens: formatReturn.length,
      transactions: formatReturn,
    };
  }
}
