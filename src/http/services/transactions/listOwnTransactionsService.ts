import { UserRepository } from "../../repositories/userRepository";
import type { ITransactionAndPayablePaginated } from "../../@types/types";
import BadRequestException from "../../exceptions/BadRequestException";
import NotFoundException from "../../exceptions/NotFoundException";
import TransactionRepository from "../../repositories/transactionRepository";

interface ListOwnTransactionsServiceRequest {
  userId: string;
  page: number;
  perPage: number;
}

export default class ListOwnTransactionsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  public async exec(
    dto: ListOwnTransactionsServiceRequest
  ): Promise<ITransactionAndPayablePaginated> {
    if (!dto.userId) {
      throw new BadRequestException("Invalid user id.");
    }

    const doesUserExists = await this.userRepository.findById(dto.userId);

    if (!doesUserExists) {
      throw new NotFoundException("User not found.");
    }

    const getUserTransactions =
      await this.transactionRepository.findAllByUserId(
        dto.userId,
        dto.page,
        dto.perPage
      );

    return getUserTransactions;
  }
}
