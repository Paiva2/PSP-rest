import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { CreateTransactionService } from "../../transactions/createTransactionService";
import { UserCreationService } from "../../user/userCreationService";
import { PAYMENT_METHOD } from "../../../enums/paymentMethod";
import type { IUser } from "../../../@types/types";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import InMemoryPayableRepository from "../../../in-memory/inMemoryPayableRepository";
import InMemoryTransactionRepository from "../../../in-memory/inMemoryTransactionRepository";
import WaitingFundsTransactionService from "../../transactions/waitingFundsTransactionService";
import Big from "big.js";
import dayjs from "dayjs";

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

const thirdUser = {
  email: "receiver2@test.com",
  password: "123456",
  fullName: "Receiver 2",
};

const dateMock = new Date(2070, 12 - 1, 1, 0, 0, 0);

describe("Waiting funds transaction service", () => {
  let userRepository: InMemoryUserRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let walletRepository: InMemoryWalletRepository;
  let payableRepository: InMemoryPayableRepository;

  let createUserService: UserCreationService;

  let createTransactionService: CreateTransactionService;
  let sut: WaitingFundsTransactionService;

  let userPaying: IUser;
  let userReceiving: IUser;
  let userReceivingTwo: IUser;

  beforeEach(async () => {
    vi.setSystemTime(dateMock);

    walletRepository = new InMemoryWalletRepository();

    userRepository = new InMemoryUserRepository(walletRepository);

    payableRepository = new InMemoryPayableRepository();

    payableRepository.setWalletRepository(walletRepository);

    payableRepository.setTransactionRepository(
      new InMemoryTransactionRepository(payableRepository)
    );

    transactionRepository = payableRepository.getTransactionRepository();

    createUserService = new UserCreationService(
      userRepository,
      walletRepository
    );

    createTransactionService = new CreateTransactionService(
      userRepository,
      transactionRepository,
      walletRepository
    );

    sut = new WaitingFundsTransactionService(
      walletRepository,
      payableRepository
    );

    userPaying = (await createUserService.exec(firstUser)).user;
    userReceiving = (await createUserService.exec(secondUser)).user;
    userReceivingTwo = (await createUserService.exec(thirdUser)).user;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should process transactions from that day that was made with CREDIT", async () => {
    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 1.000,20",
    });

    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 2.500,00",
    });

    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceivingTwo.id,
      value: "R$ 4.500,00",
    });

    //creating a transaction on another day
    vi.useRealTimers();
    await createTransactionService.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceivingTwo.id,
      value: "R$ 500,00",
    });

    const paymentDay = dayjs(new Date(2070, 12 - 1, 1, 0, 0, 0))
      .add(30, "days")
      .toDate();

    vi.setSystemTime(paymentDay);

    const walletsPaid = await sut.exec();

    expect(walletsPaid.length).toBe(3);
    expect(walletsPaid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          available: new Big("9.5019"),
          createdAt: dateMock,
          updatedAt: paymentDay,
          walletOwner: userReceiving.id,
        }),

        expect.objectContaining({
          id: expect.any(String),
          available: new Big("33.2519"),
          createdAt: dateMock,
          updatedAt: paymentDay,
          walletOwner: userReceiving.id,
        }),

        expect.objectContaining({
          id: expect.any(String),
          available: new Big("42.75"),
          createdAt: dateMock,
          updatedAt: paymentDay,
          walletOwner: userReceivingTwo.id,
        }),
      ])
    );

    const firstUserReceivingWallet = await walletRepository.findByWalletOwnerId(
      userReceiving.id
    );

    const secondUserReceivingWallet =
      await walletRepository.findByWalletOwnerId(userReceivingTwo.id);

    expect(firstUserReceivingWallet).toEqual(
      expect.objectContaining({
        available: new Big("33.2519"),
        walletOwner: userReceiving.id,
      })
    );

    expect(secondUserReceivingWallet).toEqual(
      expect.objectContaining({
        available: new Big("42.75"),
        walletOwner: userReceivingTwo.id,
      })
    );
  });
});
