import { GlobalException } from "./GlobaException";

export default class BadRequestException extends GlobalException {
  constructor(message: string) {
    super(message, 400);
  }
}
