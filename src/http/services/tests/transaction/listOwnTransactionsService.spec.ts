import { beforeEach, describe, expect, it } from "vitest";
import { CreateTransactionService } from "../../transactions/createTransactionService";
import { UserCreationService } from "../../user/userCreationService";
import { PAYABLE_STATUS } from "../../../enums/payableStatus";
import { PAYMENT_METHOD } from "../../../enums/paymentMethod";
import type { IUser } from "../../../@types/types";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import InMemoryPayableRepository from "../../../in-memory/inMemoryPayableRepository";
import InMemoryTransactionRepository from "../../../in-memory/inMemoryTransactionRepository";
import Big from "big.js";
import ListOwnTransactionsService from "../../transactions/listOwnTransactionsService";

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

  let sut: ListOwnTransactionsService;

  let createTransactionService: CreateTransactionService;

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

    createTransactionService = new CreateTransactionService(
      userRepository,
      transactionRepository,
      walletRepository
    );

    sut = new ListOwnTransactionsService(userRepository, transactionRepository);

    userPaying = (await createUserService.exec(firstUser)).user;
    userReceiving = (await createUserService.exec(secondUser)).user;
  });

  it("should list all user transactions", async () => {
    const firstTransaction = await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 1300,00",
    });

    const secondTransaction = await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.DEBIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 847.300,00",
    });

    const list = await sut.exec({
      userId: userReceiving.id,
      page: 1,
      perPage: 10,
    });

    expect(list).toEqual(
      expect.objectContaining({
        page: 1,
        perPage: 10,
        totalItens: 2,
        transactions: expect.arrayContaining([
          expect.objectContaining({
            id: firstTransaction.transaction.id,
            value: new Big("13"), // CENTS
            method: PAYMENT_METHOD.CREDIT,
            cardNumber: "**** **** **** 9999",
            cardValidationDate: "12/2080",
            cardCvv: 899,
            description: "Test Transaction",
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            payerId: userPaying.id,
            receiverId: userReceiving.id,
            payable: expect.objectContaining({
              id: expect.any(String),
              status: PAYABLE_STATUS.WAITING_FUNDS,
              value: new Big("12.35"), // CENTS
              fee: new Big("0.65"), // CENTS
              paymentDate: expect.any(Date),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
              transactionId: firstTransaction.transaction.id,
            }),
          }),
          expect.objectContaining({
            id: secondTransaction.transaction.id,
            value: new Big("8473"), // CENTS
            method: PAYMENT_METHOD.DEBIT,
            cardNumber: "**** **** **** 9999",
            cardValidationDate: "12/2080",
            cardCvv: 899,
            description: "Test Transaction",
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            payerId: userPaying.id,
            receiverId: userReceiving.id,
            payable: expect.objectContaining({
              id: expect.any(String),
              status: PAYABLE_STATUS.PAID,
              value: new Big("8218.81"), // CENTS
              fee: new Big("254.19"), // CENTS
              paymentDate: expect.any(Date),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
              transactionId: secondTransaction.transaction.id,
            }),
          }),
        ]),
      })
    );
  });
});
