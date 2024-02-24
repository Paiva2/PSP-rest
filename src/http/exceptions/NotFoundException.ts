import { GlobalException } from "./GlobaException";

export default class NotFoundException extends GlobalException {
  constructor(message: string) {
    super(message, 404);
  }
}
