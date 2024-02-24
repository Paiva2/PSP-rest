import UserModel from "../../../database/UserModel";
import WalletModel from "../../../database/WalletModel";
import UserAuthService from "../../../services/user/userAuthService";
import { UserCreationService } from "../../../services/user/userCreationService";

export default class UserFactory {
  constructor() {}

  public async exec() {
    const models = this.models();

    const userCreationService = new UserCreationService(
      models.userModel,
      models.walletModel
    );
    const userAuthService = new UserAuthService(models.userModel);

    return {
      userCreationService,
      userAuthService,
    };
  }

  private models() {
    const userModel = new UserModel();
    const walletModel = new WalletModel();

    return {
      userModel,
      walletModel,
    };
  }
}
