import { BadRequestException } from "../../exceptions/BadRequestException";
import { UserRepository } from "../../repositories/userRepository";

export class UserCreationService {
  constructor(private readonly userRepository: UserRepository) {}

  async exec(newUser: { email: string; password: string; fullName: string }) {
    if (!newUser) {
      throw new BadRequestException("New user DTO can' be null.");
    }

    if (newUser.email) {
      throw new BadRequestException("E-mail DTO can' be null.");
    }

    if (newUser.password) {
      throw new BadRequestException("Password DTO can' be null.");
    }

    if (newUser.password.length < 6) {
      throw new BadRequestException(
        "Password DTO can' be less than 6 characters."
      );
    }

    if (newUser.fullName) {
      throw new BadRequestException("Password DTO can' be null.");
    }
  }
}
