import { beforeEach, describe, expect, it } from "vitest";
import { UserCreationService } from "../../user/userCreationService";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import InMemoryWalletRepository from "../../../in-memory/inMemoryWalletRepository";
import brcrypt from "bcryptjs";
import Big from "big.js";

const newUser = {
  email: "johndoe@test.com",
  password: "123456",
  fullName: "John Doe",
};

describe("User creation service tests", () => {
  let sut: UserCreationService;
  let userRepository: InMemoryUserRepository;
  let walletRepository: InMemoryWalletRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    walletRepository = new InMemoryWalletRepository();

    sut = new UserCreationService(userRepository, walletRepository);
  });

  it("should create an new user", async () => {
    const performCreation = await sut.exec(newUser);

    const compareHashedPassword = await brcrypt.compare(
      "123456",
      performCreation.user.passwordHash
    );

    expect(compareHashedPassword).toBe(true);
    expect(performCreation).toEqual({
      user: expect.objectContaining({
        email: newUser.email,
        fullName: newUser.fullName,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),

      wallet: expect.objectContaining({
        id: expect.any(String),
        available: new Big(0),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        walletOwner: performCreation.user.id,
      }),
    });
  });

  it("should throw an exception if e-mail already exists", async () => {
    await sut.exec(newUser); // Already existing user

    await expect(() => {
      return sut.exec(newUser);
    }).rejects.toThrow("User e-mail already exists.");
  });

  it("should throw an exception if New User DTO are null", async () => {
    await expect(() => {
      //@ts-ignore
      return sut.exec(null);
    }).rejects.toThrow("New user DTO can't be null.");
  });

  it("should throw an exception if New User E-mail DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        email: "",
      });
    }).rejects.toThrow("E-mail DTO can't be null.");
  });

  it("should throw an exception if New User Password DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        password: "",
      });
    }).rejects.toThrow("Password DTO can't be null.");
  });

  it("should throw an exception if New User Full Name is null.", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        fullName: "",
      });
    }).rejects.toThrow("Full Name DTO can't be null.");
  });

  it("should throw an exception if New User Password DTO has less than 6 characters", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        password: "12345",
      });
    }).rejects.toThrow("Password DTO can't be less than 6 characters.");
  });
});
