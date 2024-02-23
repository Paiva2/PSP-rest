import { IUser, IUserCreation } from "../../@types/types";
import { UserRepository } from "../../repositories/userRepository";
import BadRequestException from "../../exceptions/BadRequestException";
import ConflictException from "../../exceptions/ConflictException";
import bcrypt from "bcryptjs";

export class UserCreationService {
  constructor(private readonly userRepository: UserRepository) {}

  public async exec(newUser: IUserCreation): Promise<IUser> {
    if (!newUser) {
      throw new BadRequestException("New user DTO can't be null.");
    }

    if (!newUser.email) {
      throw new BadRequestException("E-mail DTO can't be null.");
    }

    if (!newUser.password) {
      throw new BadRequestException("Password DTO can't be null.");
    }

    if (newUser.password.length < 6) {
      throw new BadRequestException(
        "Password DTO can't be less than 6 characters."
      );
    }

    if (!newUser.fullName) {
      throw new BadRequestException("Full Name DTO can't be null.");
    }

    const doesUserExists = await this.userRepository.findByEmail(newUser.email);

    if (doesUserExists) {
      throw new ConflictException("User e-mail already exists.");
    }

    const passwordHash = await bcrypt.hash(newUser.password, 6);

    newUser.password = passwordHash;

    const userCreation = await this.userRepository.save(newUser);

    return userCreation;
  }
}
