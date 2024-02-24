import BadRequestException from "../../exceptions/BadRequestException";
import NotFoundException from "../../exceptions/NotFoundException";
import { UserRepository } from "../../repositories/userRepository";

export class CreateTransactionService {
  constructor(private readonly userRepository: UserRepository) {}

  public async exec(userId: string) {
    if (!userId) {
      throw new BadRequestException("Invalid user id.");
    }

    const doesUserExists = await this.userRepository.findById(userId);

    if (!doesUserExists) {
      throw new NotFoundException("User not found.");
    }
  }
}
