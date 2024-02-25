import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { CreateTransactionService } from "../../transactions/createTransactionService";
import { UserCreationService } from "../../user/userCreationService";
import { randomUUID } from "crypto";
import { PAYABLE_STATUS } from "../../../enums/payableStatus";
import { PAYMENT_METHOD } from "../../../enums/paymentMethod";
import type { IUser } from "../../../@types/types";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import InMemoryPayableRepository from "../../../in-memory/inMemoryPayableRepository";
import InMemoryTransactionRepository from "../../../in-memory/inMemoryTransactionRepository";
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
    const dateMock = new Date(2070, 12 - 1, 1, 0, 0, 0);
    vi.setSystemTime(dateMock);

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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should process a new transaction with DEBIT", async () => {
    const newTransaction = await sut.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.DEBIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 3.000,20",
    });

    const checkWallet = await walletRepository.findByWalletOwnerId(
      userReceiving.id
    );

    expect(checkWallet?.updatedAt).toEqual(
      new Date("2070-12-01T03:00:00.000Z")
    );
    expect(checkWallet?.available).toEqual(new Big(29.10194));
    expect(newTransaction).toEqual({
      transaction: expect.objectContaining({
        id: newTransaction.transaction.id,
        value: new Big(30.002), // CENTS
        method: PAYMENT_METHOD.DEBIT,
        cardNumber: "**** **** **** 9999",
        cardValidationDate: "12/2080",
        cardCvv: 899,
        description: "Test Transaction",
        createdAt: new Date("2070-12-01T03:00:00.000Z"),
        updatedAt: new Date("2070-12-01T03:00:00.000Z"),
        payerId: userPaying.id,
        receiverId: userReceiving.id,
      }),
      payable: expect.objectContaining({
        id: newTransaction.payable.id,
        status: PAYABLE_STATUS.PAID,
        value: new Big(29.10194), // CENTS
        fee: new Big(0.90006), // CENTS
        paymentDate: new Date("2070-12-01T03:00:00.000Z"),
        createdAt: new Date("2070-12-01T03:00:00.000Z"),
        updatedAt: new Date("2070-12-01T03:00:00.000Z"),
        transactionId: newTransaction.transaction.id,
      }),
    });
  });

  it("should throw an exception if receiver id is the same as payer id", async () => {
    await expect(() => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "9999 9999 9999 9999",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.DEBIT,
        payerId: userReceiving.id,
        receiverId: userReceiving.id,
        value: "R$ 3.000,20",
      });
    }).rejects.toThrow("Payer id can't be the same as receiver id.");
  });

  it("should process a new transaction with CREDIT", async () => {
    const newTransaction = await sut.exec({
      cardCvv: 899,
      cardNumber: "9999 9999 9999 9999",
      cardValidationDate: "12/2080",
      description: "Test Transaction",
      method: PAYMENT_METHOD.CREDIT,
      payerId: userPaying.id,
      receiverId: userReceiving.id,
      value: "R$ 150.350,10",
    });

    const checkWallet = await walletRepository.findByWalletOwnerId(
      userReceiving.id
    );

    expect(checkWallet?.updatedAt).toEqual(
      new Date("2070-12-01T03:00:00.000Z")
    );
    expect(checkWallet?.available).toEqual(new Big(0));
    expect(newTransaction).toEqual({
      transaction: expect.objectContaining({
        id: newTransaction.transaction.id,
        value: new Big("1503.501"), // CENTS
        method: PAYMENT_METHOD.CREDIT,
        cardNumber: "**** **** **** 9999",
        cardValidationDate: "12/2080",
        cardCvv: 899,
        description: "Test Transaction",
        createdAt: new Date("2070-12-01T03:00:00.000Z"),
        updatedAt: new Date("2070-12-01T03:00:00.000Z"),
        payerId: userPaying.id,
        receiverId: userReceiving.id,
      }),
      payable: expect.objectContaining({
        id: newTransaction.payable.id,
        status: PAYABLE_STATUS.WAITING_FUNDS,
        value: new Big(1428.32595), // CENTS
        fee: new Big(75.17505), // CENTS
        paymentDate: dayjs("2070-12-01T03:00:00.000Z").add(30, "days").toDate(),
        createdAt: new Date("2070-12-01T03:00:00.000Z"),
        updatedAt: new Date("2070-12-01T03:00:00.000Z"),
        transactionId: newTransaction.transaction.id,
      }),
    });
  });

  it("should throw an exception if payer id DTO isnt provided", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "9999 9999 9999 9999",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: "",
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid payer id.");
  });

  it("should throw an exception if receiver id DTO isnt provided", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "9999 9999 9999 9999",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: "",
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid receiver id.");
  });

  it("should throw an exception if card cvv DTO isnt provided", async () => {
    await expect(async () => {
      return sut.exec({
        //@ts-ignore
        cardCvv: null,
        cardNumber: "9999 9999 9999 9999",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card CVV.");
  });

  it("should throw an exception if card number isnt valid [MORE THAN 16 NUMBERS]", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 11211",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card number.");
  });

  it("should throw an exception if card number isnt valid [LESS THAN 15 NUMBERS]", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 11",
        cardValidationDate: "12/2080",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card number.");
  });

  it("should throw an exception if card validation date isnt valid [LESS THAN 7 CHARACTERS]", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/208",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card validation date.");
  });

  it("should throw an exception if card validation date isnt valid [MORE THAN 7 CHARACTERS]", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/20800",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card validation date.");
  });

  it("should throw an exception if card validation date isnt valid [INVALID FORMAT]", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/80",
        description: "Test Transaction",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid card validation date.");
  });

  it("should throw an exception if transaction description DTO is null", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2080",
        //@ts-ignore
        description: null,
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid transaction description.");
  });

  it("should throw an exception if transaction method DTO is null", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2080",
        description: "Description test",
        //@ts-ignore
        method: null,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 150.350,10",
      });
    }).rejects.toThrow("Invalid transaction method.");
  });

  it("should throw an exception if transaction value DTO is null", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2080",
        description: "Description test",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        //@ts-ignore
        value: null,
      });
    }).rejects.toThrow("Invalid transaction value.");
  });

  it("should throw an exception if user paying does't exists", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2080",
        description: "Description test",
        method: PAYMENT_METHOD.CREDIT,
        payerId: randomUUID(),
        receiverId: userReceiving.id,
        value: "R$ 2.000,20",
      });
    }).rejects.toThrow("User not found.");
  });

  it("should throw an exception if user receiving does't exists", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2080",
        description: "Description test",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: randomUUID(),
        value: "R$ 2.000,20",
      });
    }).rejects.toThrow("User to receive not found.");
  });

  it("should throw an exception if card validation month is not valid", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "13/2080",
        description: "Description test",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 2.000,20",
      });
    }).rejects.toThrow("Invalid card validation month.");
  });

  it("should throw an exception if card validation date is expired (TODAY IS: 1, DEC, 2070 - CHECK LINE 70)", async () => {
    await expect(async () => {
      return sut.exec({
        cardCvv: 899,
        cardNumber: "1234 5678 9101 1111",
        cardValidationDate: "12/2069",
        description: "Description test",
        method: PAYMENT_METHOD.CREDIT,
        payerId: userPaying.id,
        receiverId: userReceiving.id,
        value: "R$ 2.000,20",
      });
    }).rejects.toThrow("Card validation date can't be before today.");
  });

  it("should throw an exception if transaction method DTO provided to payable is null", async () => {
    await expect(async () => {
      return sut.handleTransactionPayable({
        //@ts-ignore
        method: null,
        value: new Big(0),
      });
    }).rejects.toThrow("Invalid transaction status.");
  });
});
