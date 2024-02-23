import { GlobalException } from "./GlobaException";

export class BadRequestException extends GlobalException {
  constructor(message: string) {
    super(message, 400);
  }
}
