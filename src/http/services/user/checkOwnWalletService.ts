import BadRequestException from "../../exceptions/BadRequestException";
import NotFoundException from "../../exceptions/NotFoundException";
import PayableRepository from "../../repositories/payableRepository";
import { UserRepository } from "../../repositories/userRepository";
import Big from "big.js";

export default class CheckOwnWalletService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly payableRepository: PayableRepository
  ) {}

  public async exec(userId: string) {
    if (!userId) {
      throw new BadRequestException("Invalid user id.");
    }

    const doesUserExists = await this.userRepository.findById(userId);

    if (!doesUserExists) {
      throw new NotFoundException("User not found.");
    }

    const findUserPayables =
      await this.payableRepository.findAllUserWaitingFunds(userId);

    let totalPending = new Big(0);

    findUserPayables.forEach((payablePending) => {
      totalPending = totalPending.add(payablePending.value);
    });

    return {
      available: doesUserExists.wallet?.available,
      pending: totalPending,
    };
  }
}
