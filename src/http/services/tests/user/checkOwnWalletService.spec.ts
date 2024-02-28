import { beforeEach, describe, expect, it } from "vitest";
import { CreateTransactionService } from "../../transactions/createTransactionService";
import { UserCreationService } from "../../user/userCreationService";
import { PAYMENT_METHOD } from "../../../enums/paymentMethod";
import { randomUUID } from "crypto";
import type { IUser } from "../../../@types/types";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import InMemoryPayableRepository from "../../../in-memory/inMemoryPayableRepository";
import InMemoryTransactionRepository from "../../../in-memory/inMemoryTransactionRepository";
import CheckOwnWalletService from "../../user/checkOwnWalletService";
import Big from "big.js";

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
  let createTransactionService: CreateTransactionService;

  let sut: CheckOwnWalletService;

  let userPaying: IUser;
  let userReceiving: IUser;

  beforeEach(async () => {
    walletRepository = new InMemoryWalletRepository();

    userRepository = new InMemoryUserRepository(walletRepository);

    payableRepository = new InMemoryPayableRepository();

    transactionRepository = new InMemoryTransactionRepository(
      payableRepository
    );

    payableRepository.setTransactionRepository(transactionRepository);

    createUserService = new UserCreationService(
      userRepository,
      walletRepository
    );

    createTransactionService = new CreateTransactionService(
      userRepository,
      transactionRepository,
      walletRepository
    );

    sut = new CheckOwnWalletService(userRepository, payableRepository);

    userPaying = (await createUserService.exec(firstUser)).user;
    userReceiving = (await createUserService.exec(secondUser)).user;
  });

  it("should inform user available values and pending values", async () => {
    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "1200,00",
    });

    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 3200,00",
    });

    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.DEBIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "5300,00",
    });

    const wallet = await sut.exec(userReceiving.id);

    expect(wallet).toEqual({
      available: new Big("51.41"),
      pending: new Big("41.8"),
    });
  });

  it("should throw an exception if user id isnt provided", async () => {
    await expect(() => {
      return sut.exec("");
    }).rejects.toThrow("Invalid user id.");
  });

  it("should throw an exception if user does't exists", async () => {
    await expect(() => {
      return sut.exec(randomUUID());
    }).rejects.toThrow("User not found.");
  });
});
