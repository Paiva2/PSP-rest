import { beforeEach, describe, expect, it } from "vitest";
import { UserCreationService } from "../userCreationService";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import brcrypt from "bcryptjs";
import BadRequestException from "../../../exceptions/BadRequestException";
import ConflictException from "../../../exceptions/ConflictException";

const newUser = {
  email: "johndoe@test.com",
  password: "123456",
  fullName: "John Doe",
};

describe("User creation service tests", () => {
  let sut: UserCreationService;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new UserCreationService(userRepository);
  });

  it("should create an new user", async () => {
    const performCreation = await sut.exec(newUser);

    const compareHashedPassword = await brcrypt.compare(
      "123456",
      performCreation.passwordHash
    );

    expect(compareHashedPassword).toBe(true);
    expect(performCreation).toEqual(
      expect.objectContaining({
        email: newUser.email,
        fullName: newUser.fullName,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });

  it("should throw an exception if e-mail already exists", async () => {
    await sut.exec(newUser); // Already existing user

    await expect(() => {
      return sut.exec(newUser);
    }).rejects.toThrowError(
      new ConflictException("User e-mail already exists.")
    );
  });

  it("should throw an exception if New User DTO are null", async () => {
    await expect(() => {
      //@ts-ignore
      return sut.exec(null);
    }).rejects.toThrowError(
      new BadRequestException("New user DTO can't be null.")
    );
  });

  it("should throw an exception if New User E-mail DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        email: "",
      });
    }).rejects.toThrowError(
      new BadRequestException("E-mail DTO can't be null.")
    );
  });

  it("should throw an exception if New User Password DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        password: "",
      });
    }).rejects.toThrowError(
      new BadRequestException("Password DTO can't be null.")
    );
  });

  it("should throw an exception if New User Full Name is null.", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        fullName: "",
      });
    }).rejects.toThrowError(
      new BadRequestException("Full Name DTO can't be null.")
    );
  });

  it("should throw an exception if New User Password DTO has less than 6 characters", async () => {
    await expect(() => {
      return sut.exec({
        ...newUser,
        password: "12345",
      });
    }).rejects.toThrowError(
      new BadRequestException("Password DTO can't be less than 6 characters.")
    );
  });
});
