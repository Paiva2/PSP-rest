import UserModel from "../../../database/UserModel";
import { UserCreationService } from "../../../services/user/userCreationService";

export default class UserFactory {
  constructor() {}

  public async exec() {
    const models = this.models();

    const userCreationService = new UserCreationService(models.userModel);

    return {
      userCreationService,
    };
  }

  private models() {
    const userModel = new UserModel();

    return {
      userModel,
    };
  }
}
