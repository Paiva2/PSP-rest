import { beforeEach, describe, expect, it } from "vitest";
import { CreateTransactionService } from "../../transactions/createTransactionService";
import { UserCreationService } from "../../user/userCreationService";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import InMemoryPayableRepository from "../../../in-memory/inMemoryPayableRepository";
import InMemoryTransactionRepository from "../../../in-memory/inMemoryTransactionRepository";
import Big from "big.js";

// REMOVE FROM HERE LATER
enum PAYMENT_METHOD {
  DEBIT = "debit_card",
  CREDIT = "credit_card",
}
enum PAYABLE_STATUS {
  PAID = "paid",
  WAITING_FUNDS = "waiting_funds",
}

interface IWallet {
  id: string;
  available: Big;
  createdAt: Date;
  updatedAt: Date;
  walletOwner: string;
}

interface IUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  wallet?: IWallet;
}

//

const firstUser = {
  email: "johndoe@test.com",
  password: "123456",
  fullName: "John Doe",
};

const secondUser = {
  email: "receiver@test.com",
  password: "123456",
  fullName: "Receiver",
};

describe("Create transaction service", () => {
  let userRepository: InMemoryUserRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let walletRepository: InMemoryWalletRepository;
  let payableRepository: InMemoryPayableRepository;

  let createUserService: UserCreationService;

  let sut: CreateTransactionService;

  let userPaying: IUser;
  let userReceiving: IUser;

  beforeEach(async () => {
    walletRepository = new InMemoryWalletRepository();

    userRepository = new InMemoryUserRepository(walletRepository);

    payableRepository = new InMemoryPayableRepository();

    transactionRepository = new InMemoryTransactionRepository(
      payableRepository
    );

    createUserService = new UserCreationService(
      userRepository,
      walletRepository
    );

    sut = new CreateTransactionService(
      userRepository,
      transactionRepository,
      walletRepository
    );

    userPaying = (await createUserService.exec(firstUser)).user;
    userReceiving = (await createUserService.exec(secondUser)).user;
  });

  it("should process a new transaction with debit", async () => {
    const newTransaction = await sut.exec({
      cardCvv: 899,
      cardNumber: 1436689366325580,
      cardValidationDate: "12/2030",
      description: "Test Transaction",
      method: PAYMENT_METHOD.DEBIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 3.000,20",
    });

    expect(newTransaction).toEqual({
      transaction: expect.objectContaining({
        id: newTransaction.transaction.id,
        value: new Big(30.002),
        method: PAYMENT_METHOD.DEBIT,
        cardNumber: 1436689366325580,
        cardValidationDate: "12/2030",
        cardCvv: 899,
        description: "Test Transaction",
        createdAt: newTransaction.transaction.createdAt,
        updatedAt: newTransaction.transaction.updatedAt,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
      }),
      payable: expect.objectContaining({
        id: newTransaction.payable.id,
        status: PAYABLE_STATUS.PAID,
        value: new Big(29.10194),
        fee: new Big(0.90006),
        paymentDate: expect.any(Date),
        createdAt: newTransaction.payable.createdAt,
        updatedAt: newTransaction.payable.updatedAt,
        transactionId: newTransaction.transaction.id,
      }),
    });
  });
});
