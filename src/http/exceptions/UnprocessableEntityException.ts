import { GlobalException } from "./GlobaException";

export default class UnprocessableEntity extends GlobalException {
  constructor(message: string) {
    super(message, 422);
  }
}
