import { beforeEach, describe, expect, it } from "vitest";
import UserAuthService from "../../user/userAuthService";
import InMemoryUserRepository from "../../../in-memory/inMemoryUserRepository";
import BadRequestException from "../../../exceptions/BadRequestException";
import NotFoundException from "../../../exceptions/NotFoundException";
import ForbiddenException from "../../../exceptions/ForbiddenException";
import bcrypt from "bcryptjs";

describe("User auth service", () => {
  let userRepository: InMemoryUserRepository;

  let sut: UserAuthService;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    sut = new UserAuthService(userRepository);

    const hashedPassword = await bcrypt.hash("123456", 6);

    await userRepository.save({
      email: "johndoe@test.com",
      fullName: "John Doe",
      password: hashedPassword,
    });
  });

  it("should authenticate an user with valid credentials", async () => {
    const userAuth = await sut.exec({
      email: "johndoe@test.com",
      password: "123456",
    });

    expect(userAuth).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: "johndoe@test.com",
        fullName: "John Doe",
        password: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });

  it("should throw an exception if New User E-mail DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        email: "",
        password: "123456",
      });
    }).rejects.toThrowError(
      new BadRequestException("E-mail DTO can't be null.")
    );
  });

  it("should throw an exception if New User Password DTO are null", async () => {
    await expect(() => {
      return sut.exec({
        email: "johndoe@test.com",
        password: "",
      });
    }).rejects.toThrowError(
      new BadRequestException("Password DTO can't be null.")
    );
  });

  it("should throw an exception if user isn't registered", async () => {
    await expect(() => {
      return sut.exec({
        email: "inexistent@email.com",
        password: "123456",
      });
    }).rejects.toThrowError(new NotFoundException("User not found."));
  });

  it("should throw an exception if credentials are wrong", async () => {
    await expect(() => {
      return sut.exec({
        email: "johndoe@test.com",
        password: "wrongpass",
      });
    }).rejects.toThrowError(new ForbiddenException("Wrong credentials."));
  });
});
