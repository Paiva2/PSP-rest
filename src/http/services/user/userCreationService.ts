import { IUser, IUserCreation, IWallet } from "../../@types/types";
import { UserRepository } from "../../repositories/userRepository";
import BadRequestException from "../../exceptions/BadRequestException";
import ConflictException from "../../exceptions/ConflictException";
import { WalletRepository } from "../../repositories/walletRepository";
import bcrypt from "bcryptjs";

interface UserCreationServiceResponse {
  user: IUser;
  wallet: IWallet;
}

export class UserCreationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  public async exec(
    newUser: IUserCreation
  ): Promise<UserCreationServiceResponse> {
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

    const userWallet = await this.walletRepository.create(userCreation.id);

    return {
      user: userCreation,
      wallet: userWallet,
    };
  }
}
