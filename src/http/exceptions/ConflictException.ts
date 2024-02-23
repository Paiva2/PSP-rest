import { GlobalException } from "./GlobaException";

export default class ConflictException extends GlobalException {
  constructor(message: string) {
    super(message, 409);
  }
}
