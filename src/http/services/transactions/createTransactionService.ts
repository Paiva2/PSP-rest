import { UserRepository } from "../../repositories/userRepository";
import { WalletRepository } from "../../repositories/walletRepository";
import { PAYMENT_METHOD } from "../../enums/paymentMethod";
import { PAYABLE_STATUS } from "../../enums/payableStatus";
import type { IPayable, ITransaction } from "../../@types/types";
import BadRequestException from "../../exceptions/BadRequestException";
import NotFoundException from "../../exceptions/NotFoundException";
import TransactionRepository from "../../repositories/transactionRepository";
import ForbiddenException from "../../exceptions/ForbiddenException";
import ConflictException from "../../exceptions/ConflictException";
import Big from "big.js";
import dayjs from "dayjs";

interface CreateTransactionServiceRequest {
  value: string;
  method: PAYMENT_METHOD;
  cardNumber: string;
  cardValidationDate: string;
  cardCvv: number;
  description: string;
  payerId: string;
  receiverId: string;
}
interface CreateTransactionServiceResponse {
  transaction: ITransaction;
  payable: IPayable;
}
export class CreateTransactionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  public async exec(
    transaction: CreateTransactionServiceRequest
  ): Promise<CreateTransactionServiceResponse> {
    this.serviceParamsCheck(transaction);

    const doesPayerExists = await this.userRepository.findById(
      transaction.payerId
    );

    if (!doesPayerExists) {
      throw new NotFoundException("User not found.");
    }

    const doesReceiverExists = await this.userRepository.findById(
      transaction.receiverId
    );

    if (!doesReceiverExists) {
      throw new NotFoundException("User to receive not found.");
    }

    const [cardMonth, cardYear] = transaction.cardValidationDate.split("/");

    if (+cardMonth > 12) {
      throw new BadRequestException("Invalid card validation month.");
    }

    const validationCardDate = dayjs()
      .set("year", +cardYear)
      .set("month", +cardMonth - 1)
      .endOf("month")
      .set("hour", 0);

    const today = dayjs();

    if (validationCardDate.isBefore(today)) {
      throw new ForbiddenException(
        "Card validation date can't be before today."
      );
    }

    const value = transaction.value
      .replace("R$ ", "")
      .replace("$ ", "")
      .replaceAll(".", "")
      .replace(",", ".");

    const convertToCents = new Big(+value / 100);

    const transactionPayable = this.handleTransactionPayable({
      method: transaction.method,
      value: convertToCents,
    });

    const handleTransaction = await this.transactionRepository.save({
      transaction: {
        ...transaction,
        value: convertToCents,
        cardNumber: this.maskCardNumber(transaction.cardNumber),
      },
      payable: transactionPayable,
    });

    if (handleTransaction.payable.status === "paid") {
      await this.walletRepository?.receivePayment({
        walletOwner: transaction.receiverId,
        value: new Big(handleTransaction.payable.value),
      });
    }

    return handleTransaction;
  }

  protected maskCardNumber(cNumber: string): string {
    return `**** **** **** ${cNumber.substring(15, cNumber.length)}`;
  }

  public handleTransactionPayable(transaction: {
    method: PAYMENT_METHOD;
    value: Big;
  }): {
    payableDate: Date;
    payableStatus: PAYABLE_STATUS;
    payableFee: Big;
    payableAmount: Big;
  } {
    if (!transaction.method) {
      throw new BadRequestException("Invalid transaction status.");
    }

    const payableStatus =
      transaction.method === "credit_card"
        ? PAYABLE_STATUS.WAITING_FUNDS
        : PAYABLE_STATUS.PAID;

    const payableDate =
      payableStatus === "paid"
        ? dayjs().toDate()
        : dayjs().add(30, "days").toDate();

    const payableFeePercentage =
      transaction.method === "debit_card" ? new Big(0.03) : new Big(0.05);

    const payableFee = payableFeePercentage.mul(transaction.value);

    const payableAmount = transaction.value.minus(payableFee);

    return {
      payableDate,
      payableStatus,
      payableFee,
      payableAmount,
    };
  }

  private serviceParamsCheck(transaction: CreateTransactionServiceRequest) {
    if (!transaction.payerId) {
      throw new BadRequestException("Invalid payer id.");
    }

    if (!transaction.receiverId) {
      throw new BadRequestException("Invalid receiver id.");
    }

    if (transaction.receiverId === transaction.payerId) {
      throw new ConflictException("Payer id can't be the same as receiver id.");
    }

    if (!transaction.cardCvv || String(transaction.cardCvv).length < 3) {
      throw new BadRequestException("Invalid card CVV.");
    }

    const cardNumber = transaction.cardNumber.replaceAll(" ", "");

    if (
      !transaction.cardNumber ||
      cardNumber.trim().length > 16 ||
      cardNumber.trim().length < 15
    ) {
      throw new BadRequestException("Invalid card number.");
    }

    const expCardRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;

    if (
      !transaction.cardValidationDate ||
      String(transaction.cardValidationDate).length < 7 ||
      String(transaction.cardValidationDate).length > 7 ||
      !String(expCardRegex.test(transaction.cardValidationDate))
    ) {
      throw new BadRequestException("Invalid card validation date.");
    }

    if (!transaction.description) {
      throw new BadRequestException("Invalid transaction description.");
    }

    if (!transaction.method) {
      throw new BadRequestException("Invalid transaction method.");
    }

    if (!transaction.value) {
      throw new BadRequestException("Invalid transaction value.");
    }
  }
}
