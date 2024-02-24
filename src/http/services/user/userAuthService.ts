import { IUser } from "../../@types/types";
import BadRequestException from "../../exceptions/BadRequestException";
import ForbiddenException from "../../exceptions/ForbiddenException";
import NotFoundException from "../../exceptions/NotFoundException";
import { UserRepository } from "../../repositories/userRepository";
import bcrypt from "bcryptjs";

export default class UserAuthService {
  constructor(private readonly userRepository: UserRepository) {}

  public async exec(credentials: {
    email: string;
    password: string;
  }): Promise<IUser> {
    if (!credentials.email) {
      throw new BadRequestException("E-mail DTO can't be null.");
    }

    if (!credentials.password) {
      throw new BadRequestException("Password DTO can't be null.");
    }

    const doesUserExists = await this.userRepository.findByEmail(
      credentials.email
    );

    if (!doesUserExists) {
      throw new NotFoundException("User not found.");
    }

    const doesPasswordMatches = await bcrypt.compare(
      credentials.password,
      doesUserExists.passwordHash
    );

    if (!doesPasswordMatches) {
      throw new ForbiddenException("Wrong credentials.");
    }

    return doesUserExists;
  }
}
