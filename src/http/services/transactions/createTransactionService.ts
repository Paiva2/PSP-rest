import { UserRepository } from "../../repositories/userRepository";
import { WalletRepository } from "../../repositories/walletRepository";
import BadRequestException from "../../exceptions/BadRequestException";
import NotFoundException from "../../exceptions/NotFoundException";
import TransactionRepository from "../../repositories/transactionRepository";
import ForbiddenException from "../../exceptions/ForbiddenException";
import Big from "big.js";
import dayjs from "dayjs";

// REMOVE FROM HERE LATER
enum PAYMENT_METHOD {
  DEBIT = "debit_card",
  CREDIT = "credit_card",
}
enum PAYABLE_STATUS {
  PAID = "paid",
  WAITING_FUNDS = "waiting_funds",
}

interface ITransaction {
  id?: string;
  value: Big;
  method: PAYMENT_METHOD;
  cardNumber: number;
  cardValidationDate: string;
  cardCvv: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;

  payerId: string;
  receiverId: string;
}

interface IPayable {
  id: string;
  status: PAYABLE_STATUS;
  value: Big;
  fee: Big;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;

  transactionId: string;
}

//

interface CreateTransactionServiceRequest {
  value: string;
  method: PAYMENT_METHOD;
  cardNumber: number;
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

    const validationCardDate = dayjs();

    validationCardDate.set("year", +cardYear);
    validationCardDate.set("month", +cardMonth - 1);

    const cardDateFormat = validationCardDate.endOf("month");

    const today = dayjs();

    if (cardDateFormat.isBefore(today)) {
      throw new ForbiddenException(
        "Card validation date can't be before today."
      );
    }

    const value = transaction.value
      .replace("R$ ", "")
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
      },
      payable: transactionPayable,
    });

    if (handleTransaction.payable.status === "paid") {
      await this.walletRepository?.receivePayment({
        walletOwner: transaction.receiverId,
        value: handleTransaction.payable.value,
      });
    }

    return handleTransaction;
  }

  private handleTransactionPayable(transaction: {
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
        : dayjs().add(30, "day").toDate();

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
      throw new BadRequestException("Invalid user id.");
    }

    if (!transaction.receiverId) {
      throw new BadRequestException("Invalid user id.");
    }

    if (!transaction.cardCvv || String(transaction.cardCvv).length < 3) {
      throw new BadRequestException("Invalid card CVV.");
    }

    if (
      !transaction.cardNumber ||
      String(transaction.cardNumber).length > 16 ||
      String(transaction.cardNumber).length < 13
    ) {
      throw new BadRequestException("Invalid card number.");
    }

    if (
      !transaction.cardValidationDate ||
      String(transaction.cardValidationDate).length < 7 ||
      String(transaction.cardValidationDate).length > 7
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
