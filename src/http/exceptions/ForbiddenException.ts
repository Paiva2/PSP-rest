import { GlobalException } from "./GlobaException";

export default class ForbiddenException extends GlobalException {
  constructor(message: string) {
    super(message, 403);
  }
}
